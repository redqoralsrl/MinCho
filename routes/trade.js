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

//매수
router.post('/buy', function(req,res,next){
    console.log(req.body);
    const coin_name = req.body.coin_name;
    const coin_price = req.body.coin_value;
    const user_money = req.body.number;
    const user_id = req.session.userId;
    // 최소 주문 금액 설정
    if(user_money < 1000) res.send("<script>alert('최소 주문금액 맞춰주세요!');history.back();</script>")
    client.query('select * from userdb where id=?',[user_id],(err,data)=>{
        if(err) console.log(err);
        // 보유 잔액보다 큰 금액 입력시 실행
        if(user_money > data[0].balance) res.send("<script>alert('보유 잔액이 부족합니다!');history.back();</script>")
        const changed_money = data[0].balance - user_money;
        client.query('update userdb set balance=? where id=?',[changed_money, user_id],(err,data)=>{
            req.session.balance = changed_money;
            req.session.save();
        })
    })
    client.query('insert into trade (id, money, coin_name, trade_coin_count, action) values(?,?,?,?,"매수")',[user_id, user_money, coin_name, user_money/coin_price],(err)=>{
        if(err) console.log(err);
        //wallet db에 로그인한 사람이 그 코인 산 기록 있는지 확인
        client.query('select * from wallet where id=? and coin_name=?',[user_id, coin_name], (err, result) => {
            if(err) console.log(err);
            console.log("wallet에 그 코인 산 행 있냐", result[0]);
            //처음 사요
            if(result[0] == undefined){
                client.query('insert into wallet (id, coin_name, wallet_coin_count, avg_buy_price) values(?,?,?,?)', [user_id, coin_name, user_money/coin_price, coin_price], (err) => {
                    if(err) console.log(err);
                })
            } else { //산 적 있어요
                
            }
        })
    })
});

router.post('/sell', function(req, res, next){
    
});

module.exports = router;