const mysql = require('mysql');

const  client = mysql.createConnection({
    host : 'localhost',
    port : 3306,
    // port : 3307,
    user : 'root',
    password : 'brian1313',
    // password : '1234',
    database : 'mincho',
    multipleStatements: true,
});

module.exports = client;