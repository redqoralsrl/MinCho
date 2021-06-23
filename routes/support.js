const express = require('express');
const ejs = require('ejs');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('support',{
        title : ejs.render('title')
    });
});

module.exports = router;