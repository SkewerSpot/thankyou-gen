const assert = require('assert');
const Util = require('../util');

describe('Util', function() {
  describe('create6DigitCode()', function() {
    it('should output a string', function() {
      const code = Util.create6DigitCode();
      assert.equal(typeof code, 'string');
    });

    it('should output a string with exactly 6 digits', function() {
      const code = Util.create6DigitCode();
      assert.equal(/^(\d){6}$/.test(code), true);
    });
  });
});
