const assert = require('assert');
const sqlite = require('sqlite3');
const SQL = require('sql-template-strings');

process.env.SQLITE_DB_PATH = ':memory:';
const dbLib = require('../db/db-lib');

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

  describe('migrateDb()', function() {
    it('should migrate the database', async function() {
      const result = await dbLib.migrateDb();
      assert.deepEqual(result, [{ id: 1, name: 'initial-schema' }]);
    });
  });
});
