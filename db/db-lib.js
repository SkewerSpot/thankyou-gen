const sqlite = require('sqlite');
require('dotenv').config();

/**
 * Executes the given DDL statement.
 *
 * Does not validate whether the given statement is indeed a DDL statement.
 *
 * @param {String} command A data definition language statement, such as `CREATE TABLE`.
 *
 * @returns {Promise} A `Statement` object that represents result of the execution.
 */
async function executeCommand(command) {
  try {
    const db = await sqlite.open(process.env.SQLITE_DB_PATH);
    const result = await db.run(command);
    await db.close();
    return result;
  } catch (e) {
    throw Error(e);
  }
}

/**
 * Applies SQL migrations contained inside homonymous directory.
 *
 * @returns {Promise}
 */
async function migrateDb() {
  try {
    const db = await sqlite.open(process.env.SQLITE_DB_PATH);
    await db.migrate({ migrationsPath: './db/migrations' });
    const migrationData = await db.all('SELECT id, name FROM migrations');
    await db.close();
    return migrationData;
  } catch (e) {
    throw Error(e);
  }
}

module.exports = {
  executeCommand,
  migrateDb
};
