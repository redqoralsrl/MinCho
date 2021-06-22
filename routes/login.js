const express = require('express');
const ejs = require('ejs');
const router = express.Router();

const crypto = require('crypto');


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('login',{
        title : ejs.render('title')
    });
});

module.exports = router;