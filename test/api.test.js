/**
 * The tests make actual API calls. No stubs or mocks are used.
 *
 * Read more about why and when stubs are necessary:
 * https://mherman.org/blog/stubbing-http-requests-with-sinon/#what-is-a-stub
 *
 * Also, we've configured chai for TDD-style tests to be consistent with
 * our existing unit tests.
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
process.env.SQLITE_DB_PATH = './db/generated-codes.test.db';
const App = require('../index');
const DbLib = require('../db/db-lib');

before(seedData);
after(DbLib.deleteDb);

/**
 * Adds some seed data to help in testing.
 */
async function seedData() {
  await DbLib.migrateDb();
  const code1 = '111111';
  const ts1 = new Date().toISOString();
  const code2 = '222222';
  const ts2 = '';
  const code3 = '333333';
  const ts3 = '';
  await DbLib.executeStatement(
    `INSERT INTO unique_codes VALUES ( '${code1}', '${ts1}' ), ( '${code2}', '${ts2}' ), ( '${code3}', '${ts3}' )`
  );
  console.log('Seeding done');
  console.log(`path: ${process.env.SQLITE_DB_PATH}`);
}

chai.use(chaiHttp);

describe('API', function() {
  describe('GET /api/unique-codes', function() {
    it('should return error when count param is not specified', function(done) {
      chai
        .request(App)
        .get('/api/unique-codes')
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          done();
        });
    });

    it('should return error when count param is not an integer', function(done) {
      chai
        .request(App)
        .get('/api/unique-codes?count=abc')
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          done();
        });
    });

    it('should return error when count is less than 0', function(done) {
      chai
        .request(App)
        .get('/api/unique-codes?count=-100')
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          done();
        });
    });

    it('should return error when count is greater than 1000', function(done) {
      chai
        .request(App)
        .get('/api/unique-codes?count=2000')
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          done();
        });
    });

    it('should return correct number of dummy codes', function(done) {
      chai
        .request(App)
        .get('/api/unique-codes?count=10&dummy=true')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.lengthOf(res.body, 10);
          done();
        });
    });

    it('should return correct number of actual codes', function(done) {
      chai
        .request(App)
        .get('/api/unique-codes?count=2')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.lengthOf(res.body, 2);
          done();
        });
    });
  });
});
