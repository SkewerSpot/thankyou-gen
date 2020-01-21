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

module.exports = {
  create6DigitCode
};
