require('dotenv').config();
const express = require('express');
const apiRoutes = require('./api');

const app = express();
const port = 1337;

app.use(express.static('public'));
app.use('/api', apiRoutes);

app.listen(port, () => console.log(`Listening on port ${port}`));
