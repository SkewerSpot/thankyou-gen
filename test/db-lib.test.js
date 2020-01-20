const fs = require('fs');
const assert = require('assert');
const sqlite = require('sqlite3');
const SQL = require('sql-template-strings');

process.env.SQLITE_DB_PATH = './db/generated-codes.test.db';
const dbLib = require('../db/db-lib');

before(deleteDb);
after(deleteDb);

/**
 * Deletes the SQLite database file used by test environment.
 */
function deleteDb() {
  if (fs.existsSync(process.env.SQLITE_DB_PATH)) {
    fs.unlinkSync(process.env.SQLITE_DB_PATH);
  }
}

/**
 * Adds some seed data to help in testing.
 */
async function seedData() {
  await dbLib.migrateDb();
  const code = '111111';
  const ts = new Date().toISOString();
  await dbLib.executeStatement(
    SQL`INSERT INTO unique_codes VALUES ( ${code}, ${ts} )`
  );
}

/**
 * Suite of tests.
 */
describe('DB lib', function() {
  describe('executeCommand()', function() {
    it('should return an error when an invalid statement is given', async function() {
      try {
        await dbLib.executeCommand('CREATE TABLE');
      } catch (e) {
        assert.notEqual(e.message.indexOf('SQLITE_ERROR'), -1);
      }
    });

    it('should run without error when a valid statement is given', async function() {
      const result = await dbLib.executeCommand(`
        CREATE TABLE IF NOT EXISTS unique_codes (
            code TEXT PRIMARY KEY,
            generated_date TEXT 
        )
      `);
      assert.equal(result.changes, 0);
    });
  });

  describe('executeStatement()', function() {
    before(async function() {
      deleteDb();
      await seedData();
    });

    after(deleteDb);

    it('should successfully add a new row', async function() {
      const code = '123456';
      const ts = new Date().toISOString();
      const statement = SQL`INSERT INTO unique_codes VALUES ( ${code}, ${ts} )`;

      const result = await dbLib.executeStatement(statement);

      assert.equal(result.changes, 1);
      assert.equal(result.sql, `INSERT INTO unique_codes VALUES ( ?, ? )`);
    });

    it('should successfully update an existing row', async function() {
      const code = '123456';
      const newCode = '654321';
      const statement = SQL`UPDATE unique_codes SET code = ${newCode} WHERE code = ${code}`;

      const result = await dbLib.executeStatement(statement);

      assert.equal(result.changes, 1);
      assert.equal(
        result.sql,
        `UPDATE unique_codes SET code = ? WHERE code = ?`
      );
    });

    it('should successfully delete an existing row', async function() {
      const code = '654321';
      const statement = SQL`DELETE FROM unique_codes WHERE code = ${code}`;

      const result = await dbLib.executeStatement(statement);

      assert.equal(result.changes, 1);
      assert.equal(result.sql, `DELETE FROM unique_codes WHERE code = ?`);
    });

    it('should throw error when an incomplete statement is given', async function() {
      const statement = 'INSERT';

      try {
        await dbLib.executeStatement(statement);
      } catch (e) {
        assert.notEqual(e.message.indexOf('SQLITE_ERROR'), -1);
      }
    });

    it('should throw error when an invalid statement is given', async function() {
      const nonExistentCode = '999999';
      const statement = SQL`DELETE FROM unique_codes WHERE code = ${nonExistentCode}`;

      try {
        await dbLib.executeStatement(statement);
      } catch (e) {
        assert.notEqual(e.message.indexOf('SQLITE_ERROR'), -1);
      }
    });
  });

  describe('executeQuery()', function() {
    before(async function() {
      deleteDb();
      await seedData();
    });

    after(deleteDb);

    it('should return all existing codes', async function() {
      const query = SQL`SELECT * FROM unique_codes`;

      const result = await dbLib.executeQuery(query);

      assert.equal(result.length, 1);
    });

    it('should return a specific existing code', async function() {
      const query = SQL`SELECT * FROM unique_codes WHERE code = '111111'`;

      const result = await dbLib.executeQuery(query);

      assert.equal(result.length, 1);
    });

    it('should throw error when an incomplete query is given', async function() {
      const query = 'SELECT';

      try {
        await dbLib.executeQuery(query);
      } catch (e) {
        assert.notEqual(e.message.indexOf('SQLITE_ERROR'), -1);
      }
    });

    it('should throw error when an invalid query is given', async function() {
      const queryWithInvalidCol = SQL`SELECT code, created_by FROM unique_codes`;

      try {
        await dbLib.executeQuery(queryWithInvalidCol);
      } catch (e) {
        assert.notEqual(e.message.indexOf('SQLITE_ERROR'), -1);
      }
    });
  });

  describe('migrateDb()', function() {
    it('should migrate the database', async function() {
      const result = await dbLib.migrateDb();
      assert.deepEqual(result, [{ id: 1, name: 'initial-schema' }]);
    });
  });

  describe('addUniqueCodes()', function() {
    before(async function() {
      deleteDb();
      await seedData();
    });

    after(deleteDb);

    it('should throw error if given input is not an array', async function() {
      try {
        const invalidInput = {};
        await dbLib.addUniqueCodes(invalidInput);
      } catch (e) {
        assert.equal(e.message, 'Input must be an array of 6-digit strings');
      }
    });

    it('should throw error if given input array contains invalid codes', async function() {
      try {
        const arrayOfInvalidCodes = ['123', 'abcdef'];
        await dbLib.addUniqueCodes(arrayOfInvalidCodes);
      } catch (e) {
        assert.equal(e.message, 'Input must be an array of 6-digit strings');
      }
    });

    it('should successfully add given 6-digit codes', async function() {
      const codes = ['123456', '234567', '345678'];

      const numCodesAdded = await dbLib.addUniqueCodes(codes);

      assert.equal(numCodesAdded, 3);
    });
  });
});
