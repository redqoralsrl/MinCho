const express = require('express');
const router = express.Router();
const ejs = require('ejs');

router.get('/', function(req, res, next) {
    if (req.session.logined == true) {
        res.render('trade', {
            logined: true,
            title : ejs.render('title'),
        });
    }
    else {
        res.render('trade',{
            logined : false,
            title : ejs.render('title'),
        });
    }
});

module.exports = router;