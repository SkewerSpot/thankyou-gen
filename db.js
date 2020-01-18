const sqlite = require('sqlite3');

const SQLITE_DB_PATH = './generated-codes.db';

async function createDatabase() {
  const stmtCreateTblUniqueCodes = `
        CREATE TABLE IF NOT EXISTS unique_codes (
            code TEXT PRIMARY KEY,
            generated_date TEXT 
        )
    `;
  await executeCommand(stmtCreateTblUniqueCodes);
}

/**
 * Executes the given DDL statement.
 *
 * Does not validate whether the given statement is indeed a DDL statement.
 *
 * @param {String} statement A data definition language statement, such as `CREATE TABLE`.
 */
async function executeCommand(statement) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    try {
      db.serialize(() => {
        db.run(statement);
        resolve();
      });
    } catch (e) {
      console.error(`Error in executeCommand(): ${e}`);
      reject(e);
    }
  });
}

/**
 * Opens our SQLite database to perform operations
 * and then closes it.
 */
async function openDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite.Database(SQLITE_DB_PATH, err => {
      if (err) {
        console.error(`Error in openDatabase(): ${err}`);
        return reject(err);
      }

      resolve(db);

      db.close(err => reject(err));
    });
  });
}

module.exports = {
  createDatabase,
  executeCommand,
  openDatabase
};
