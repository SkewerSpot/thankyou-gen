const fs = require('fs');
const assert = require('assert');
const sqlite = require('sqlite3');
const SQL = require('sql-template-strings');

process.env.SQLITE_DB_PATH = './db/generated-codes.test.db';
const dbLib = require('../db/db-lib');

before(dbLib.deleteDb);
after(dbLib.deleteDb);

/**
 * Adds some seed data to help in testing.
 */
async function seedData() {
  await dbLib.migrateDb();
  const code1 = '111111';
  const ts1 = new Date().toISOString();
  const code2 = '222222';
  const ts2 = '';
  const code3 = '333333';
  const ts3 = '';
  await dbLib.executeStatement(
    `INSERT INTO unique_codes VALUES ( '${code1}', '${ts1}' ), ( '${code2}', '${ts2}' ), ( '${code3}', '${ts3}' )`
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
      dbLib.deleteDb();
      await seedData();
    });

    after(dbLib.deleteDb);

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
      dbLib.deleteDb();
      await seedData();
    });

    after(dbLib.deleteDb);

    it('should return all existing codes', async function() {
      const query = SQL`SELECT * FROM unique_codes`;

      const result = await dbLib.executeQuery(query);

      assert.equal(result.length, 3);
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
      dbLib.deleteDb();
      await seedData();
    });

    after(dbLib.deleteDb);

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

  describe('isDbInitialized()', function() {
    it('should return false if database file does not exist', async function() {
      const result = await dbLib.isDbInitialized();
      assert.equal(result, false);
    });

    it('should return false if seed data does not exist', async function() {
      await dbLib.migrateDb();
      const result = await dbLib.isDbInitialized();
      dbLib.deleteDb();

      assert.equal(result, false);
    });

    it('should return false if only partial seed data exists', async function() {
      await dbLib.migrateDb();
      await seedData();
      const result = await dbLib.isDbInitialized();
      dbLib.deleteDb();

      assert.equal(result, false);
    });
  });

  describe('generateUniqueCodes()', function() {
    before(async function() {
      dbLib.deleteDb();
      await seedData();
    });

    after(dbLib.deleteDb);

    it('should return correct number of unique codes as requested', async function() {
      const codes = await dbLib.generateUniqueCodes(2);
      assert.equal(codes.length, 2);
    });

    it('should make generated codes unavailable for further use', async function() {
      const codes = await dbLib.generateUniqueCodes(2);
      assert.equal(codes.length, 0);
    });

    it('should return 0 unique codes when numCodes argument is omitted', async function() {
      const codes = await dbLib.generateUniqueCodes();
      assert.equal(codes.length, 0);
    });
  });
});
