const mysql = require('mysql');

const  client = mysql.createConnection({
    host : 'localhost',
    port : 3306,
    user : 'root',
    password : 'brian1313',
    database : 'mincho',
    multipleStatements: true,
});

module.exports = client;