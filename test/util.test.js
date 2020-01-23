const assert = require('assert');
const Util = require('../util');

const UNIQUE_CODE_PATTERN = /^(\d){6}$/;

describe('Util', function() {
  describe('create6DigitCode()', function() {
    it('should output a string', function() {
      const code = Util.create6DigitCode();
      assert.equal(typeof code, 'string');
    });

    it('should output a string with exactly 6 digits', function() {
      const code = Util.create6DigitCode();
      assert.equal(UNIQUE_CODE_PATTERN.test(code), true);
    });
  });

  describe('generateDummyUniqueCodes()', function() {
    it('should generate correct number of codes as requested', function() {
      const codes = Util.generateDummyUniqueCodes(10);
      assert.equal(codes.length, 10);
      codes.forEach(code => assert.equal(UNIQUE_CODE_PATTERN.test(code), true));
    });
  });
});
