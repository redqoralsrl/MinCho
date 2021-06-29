const express = require('express');
const router = express.Router();
const client = require('./mysql');

router.post('/', (req,res,err)=>{
    client.query('insert into tlqkf ("test") values (?)',['시발'])
})

module.exports = router;