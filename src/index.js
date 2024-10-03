require('dotenv').config();
const express = require('express');
const ConnectionDB = require('../src/Db/index.js');
const app = require("./app.js")

ConnectionDB();

// const app = express();

app.listen(process.env.PORT, () => {
    console.log(`Server running on port # ${process.env.PORT}`);
});
