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
    const result = await db.run(statement);
    await db.close();
    return result;
  } catch (e) {
    throw Error(e);
  }
}

module.exports = {
  executeCommand
};
