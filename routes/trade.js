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
    client.query('select * from userdb where id=?',[req.session.userId],(err,data)=>{
        if(err) console.log(err);
        const result = data[0].balance * (req.body.percent / 100);
        res.send({result : result});
    })
})

router.post('/buy', function(req,res,next){
    const coin_price = req.body.coin_value;
    const user_money = req.body.number;
    client.query('select * from userdb where id=?',[req.session.userId],(err,data)=>{
        if(err) console.log(err);
        if(data[0].balance < user_money) res.send("<script>alert('보유 돈이 부족합니다'); history.back();</script>")
        else{
            const change_money = data[0].balance - user_money;
            client.query('update userdb set balance=? where id=?',[change_money, req.session.userId],(err,data)=>{
                req.session.balance = change_money;
                req.session.save();
            })
        }
    })
});

router.post('/sell', function(req, res, next){

});

module.exports = router;