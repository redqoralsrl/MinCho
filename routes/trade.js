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

router.post('/number', function(req,res,next){
    console.log('dataaaaaaaa', req.body.percent);
    client.query('select * from userdb where id=?',[req.session.userId],(err,data)=>{
        if(err) console.log(err);
        const result = data[0].balance * (req.body.percent / 100);
        res.send({result : result});
    })
})

router.post('/buy', function(req,res,next){
    // console.log(req.body);
    // const coin_price = req.body.coin_value;
    // const user_money = req.body.number;
    // client.query('select * from userdb where id=?',[req.session.userId],(err,data)=>{
    //     if(err) console.log(err);
    //     const change_money = data[0].balance - user_money;
    //     client.query('update userdb set balance=? where id=?',[],(err,data)=>{

    //     })
    // })
});

router.post('/sell', function(req, res, next){

});

module.exports = router;