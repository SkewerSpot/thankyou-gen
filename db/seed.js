/**
 * This script seeds the database with all possible unique codes
 * in advance.
 *
 * It involves the following steps:
 *
 * 1. Create a list of unique codes in random order.
 * 2. Initialize database schema (apply migrations).
 * 3. Add the codes to database.
 *
 * The whole process may take anywhere between a few seconds
 * up to a minute to execute. This is a one-time tradeoff.
 *
 * Having all possible unique codes "cached" in the database
 * will make it substantially quicker to "generate" unique codes later.
 *
 * See `db-lib.js` for details on how code generation works.
 */

const fs = require('fs');
const DbLib = require('./db-lib');
const Util = require('../util');

seedDatabase();

/**
 * Initialzes database schema and adds seed data.
 *
 * Seed data is all possible 6-digit unique codes in random order.
 */
async function seedDatabase() {
  try {
    if (!(await DbLib.isDbInitialized())) {
      console.log('✨ Database not yet initialized. Initializing...');
      const startTime = new Date();

      DbLib.deleteDb();
      await DbLib.migrateDb();

      let codes = new Set(); // ensures uniqueness

      while (codes.size !== DbLib.NUM_POSSIBLE_CODES) {
        codes.add(Util.create6DigitCode());
      }

      const codesArr = Array.from(codes);
      const batchSize = 10000;

      for (let i = 0; i <= codesArr.length - batchSize; i += batchSize) {
        const start = i;
        const end = start + batchSize;
        const batch = codesArr.slice(start, end);
        const numCodesAdded = await DbLib.addUniqueCodes(batch);

        if (numCodesAdded != batchSize) {
          return console.log('Something went wrong. Try again.');
        }
      }

      const endTime = new Date();
      console.log(
        `✅ Database initialized in ${(endTime - startTime) / 1000} secs.`
      );
    } else {
      console.log('⚠️  Database is already initialized.');
    }
  } catch (e) {
    console.log(e.message);
  }
}
