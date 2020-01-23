const express = require('express');
const router = express.Router();
const DbLib = require('./db/db-lib');
const Util = require('./util');

/**
 * Returns an array of `count` unique codes.
 *
 * The API endpoint optionally espects two query string params:
 * - count: The desired number of unique codes to generate (bet. 1-1000).
 * - dummy: If 'true', return dummy codes. Otherwise, generate from database.
 *
 * Sample usage:
 * - /unique-codes?count=100
 * - /unique-codes?count=100&dummy=true
 */
router.get('/unique-codes', async (req, res) => {
  let count = 0;
  let dummyMode = false;
  let codes = [];

  count = parseInt(req.query.count);
  if (isNaN(count) || count < 0 || count > 1000) {
    return res.status(400).json({
      error: '`count` query param must be an integer between 0-1000'
    });
  }

  dummyMode = req.query.dummy === 'true';

  if (dummyMode) {
    codes = Util.generateDummyUniqueCodes(count);
  } else {
    codes = await DbLib.generateUniqueCodes(count);
  }

  res.json(codes);
});

module.exports = router;
