const DbLib = require('./db/db-lib');

/**
 * Returns a random 6-digit code.
 *
 * The uniqueness part is not guaranteed as no memoization is used.
 */
function create6DigitCode() {
  let randomNum = Math.floor(Math.random() * DbLib.NUM_POSSIBLE_CODES);
  let code = randomNum.toString();
  code = '0'.repeat(6 - code.length) + code; // for codes < 100000
  return code;
}

/**
 * Returns `numCodes` random 6-digit unique codes.
 *
 * This function complements `DbLib.generateUniqueCodes()`.
 * Since generating unique codes from cached codes in database
 * makes them unusable for further generations,
 * this function lets one generate codes without such a side effect.
 *
 * @param {Number} numCodes The desired number of unique codes.
 *
 * @returns {Array} A string array of unique codes.
 */
function generateDummyUniqueCodes(numCodes) {
  const codeSet = new Set(); // ensures uniqueness

  while (codeSet.size !== numCodes) {
    codeSet.add(create6DigitCode());
  }

  return Array.from(codeSet);
}

module.exports = {
  create6DigitCode,
  generateDummyUniqueCodes
};
