const express = require('express');
const router = express.Router();

router.post('/unique-codes', (req, res) => {
  res.json({ message: 'Haha' });
});

module.exports = router;
