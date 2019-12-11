const {JsonDB} = require('node-json-db');
const path = require('path');

// simple database to store albums information
let db = new JsonDB(path.resolve(__dirname, '../db'), true, true);

module.exports = db;
