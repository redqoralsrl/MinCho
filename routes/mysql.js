const mysql = require('mysql');

const  client = mysql.createConnection({
    host : 'localhost',
    port : 3307,
    user : 'root',
    password : '1234',
    database : 'mincho',
    multipleStatements: true,
});

module.exports = client;