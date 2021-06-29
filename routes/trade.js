const express = require('express');
const router = express.Router();
const ejs = require('ejs');

router.get('/', function(req, res, next) {
    if (req.session.logined == true) {
        logined = true;
    } else { 
        logined = false; 
    }
    res.render('trade',{
        logined,
        title : ejs.render('title'),
    });
});

module.exports = router;