require('dotenv').config();
const express = require('express');
const apiRoutes = require('./api');

const app = express();
const port = 1337;

app.use(express.static('public'));
app.use('/api', apiRoutes);

// Save Server instance in a custom prop
// Especially useful in stopping the server once automated tests have finished
app.server = app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;
