const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const client = require("./mysql");

router.get('/', function(req, res, next) {
    client.query('select * from userdb where id=?',[req.session.userId],(err,data)=>{
        if(err) console.log(err);
        if (req.session.logined == true) {
            logined = true;
        } else { 
            logined = false; 
        }
        res.render('trade',{
            logined,
            data : data,
            title : ejs.render('title'),
        });
    })
});

router.post('/buy', function(req,res,next){

});

router.post('/sell', function(req, res, next){

});

module.exports = router;