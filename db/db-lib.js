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
 * Executes the given parameterized DML statement.
 *
 * Does not validate whether the given statement is indeed a DML statement.
 *
 * @param {String} statement A data manipulation language statement,
 * such as `INSERT` and `UPDATE`.
 *
 * @returns {Promise} A `Statement` object that represents result of the execution.
 */
async function executeStatement(statement) {
  try {
    const db = await sqlite.open(process.env.SQLITE_DB_PATH);
    const preparedStatement = await db.prepare(statement); // this step is required for statements with params
    const result = await preparedStatement.run();
    await preparedStatement.finalize();
    await db.close();
    return result;
  } catch (e) {
    throw Error(e);
  }
}

/**
 * Executes the given parameterized DQL statement.
 *
 * Does not validate whether the given statement is indeed a DQL statement.
 *
 * @param {String} query A data query language statement, that is `SELECT`.
 *
 * @returns {Promise} An array of objects that represent rows returned
 * as the result of query execution.
 */
async function executeQuery(query) {
  try {
    const db = await sqlite.open(process.env.SQLITE_DB_PATH);
    const preparedStatement = await db.prepare(query); // this step is required for statements with params
    const result = await preparedStatement.all();
    await preparedStatement.finalize();
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
  executeStatement,
  executeQuery,
  migrateDb
};
