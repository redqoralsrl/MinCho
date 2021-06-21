const mysql = require('mysql');

const  client = mysql.createConnection({
    host : 'localhost',
    port : 3306,
    user : 'root',
    password : '',
    database : 'sublogin'
});

module.exports = client;