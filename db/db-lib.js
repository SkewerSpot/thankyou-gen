const fs = require('fs');
const sqlite = require('sqlite');
require('dotenv').config();

/**
 * The total number of possible 6-digit unique codes
 * between 000000 - 999999 (both values inclusive).
 */
const NUM_POSSIBLE_CODES = 1000000;

/**
 * Adds the given codes in database.
 *
 * @param {Array} codes A collection of 6-digit code strings.
 *
 * @returns {Promise} Count of codes successfully added.
 */
async function addUniqueCodes(codes) {
  const inputIsArray = Array.isArray(codes);
  const inputArrayHas6digitStrings =
    codes.length > 0 &&
    typeof codes[0] === 'string' &&
    /^(\d){6}$/.test(codes[0]);

  if (!inputIsArray || !inputArrayHas6digitStrings)
    throw Error('Input must be an array of 6-digit strings');

  const generatedDate = ''; // empty date means the code is yet unused
  const statement = `INSERT INTO unique_codes VALUES ${codes
    .map(code => `( '${code}', '${generatedDate}' )`)
    .join(', ')}`;

  const result = await executeStatement(statement);
  return result.changes;
}

/**
 * Checks whether our SQLite database is properly initialized
 * with initial schema.
 *
 * The following checks are performed:
 * - database file exists
 * - intial schema has been migrated
 * - seed data has been added
 */
async function isDbInitialized() {
  if (!fs.existsSync(process.env.SQLITE_DB_PATH)) return false;

  const querySchemaCheck = `SELECT name FROM sqlite_master WHERE type='table' AND name='unique_codes'`;
  const resultSchemaCheck = await executeQuery(querySchemaCheck);
  if (resultSchemaCheck.length !== 1) return false;

  const querySeedDataCheck = `SELECT COUNT(code) AS num_codes FROM unique_codes`;
  const resultSeedDataCheck = await executeQuery(querySeedDataCheck);
  if (resultSeedDataCheck[0].num_codes != NUM_POSSIBLE_CODES) return false;

  return true;
}

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
  NUM_POSSIBLE_CODES,
  addUniqueCodes,
  isDbInitialized,
  executeCommand,
  executeStatement,
  executeQuery,
  migrateDb
};
