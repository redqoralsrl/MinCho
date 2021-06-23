const express = require('express');
const ejs = require('ejs');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session.logined == true){
        res.render('support',{
            logined : true,
            title : ejs.render('title')
        });
    }else{
        res.render('support',{
            logined : false,
            title : ejs.render('title')
        });
    }
    
});

module.exports = router;