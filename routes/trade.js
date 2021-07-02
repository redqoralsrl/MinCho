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

router.post('/coin', function(req,res,next){
    client.query('select * from wallet where id=? and coin_name=?',[req.session.userId, req.body.coin],(err,data)=>{
        if(err) console.log(err);
        if(data != ""){
            const result = data[0].wallet_coin_count * (req.body.percent / 100);
            res.send({result : result});
        }
    })
})

//매수
router.post('/buy', function(req,res,next){
    console.log(req.body);
    const coin_name = req.body.coin_name;
    const coin_price = Number(req.body.coin_value.replace(/,/g,""));
    const user_money = Number(req.body.number); //잔고용
    const real_money = user_money * 0.95;   //실제 사지는 것
    const user_id = req.session.userId;
    const trd_coin_cnt = real_money/coin_price;
    // 최소 주문 금액 설정
    if(user_money < 1000) res.send("<script>alert('최소 주문금액 맞춰주세요!');history.back();</script>");
    else{
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
        client.query('insert into trade (id, money, coin_name, trade_coin_count, action) values(?,?,?,?,"매수")',[user_id, user_money, coin_name, trd_coin_cnt],(err)=>{
            if(err) console.log(err);
            //wallet db에 로그인한 사람이 그 코인 산 기록 있는지 확인
            client.query('select * from wallet where id=? and coin_name=?',[user_id, coin_name], (err, result) => {
                if(err) console.log(err);
                //처음 사요
                if(result[0] == undefined){
                    client.query('insert into wallet (id, coin_name, wallet_coin_count, avg_buy_price) values(?,?,?,?)', [user_id, coin_name, trd_coin_cnt, coin_price], (err) => {
                        if(err) console.log(err);
                    })
                } else { //산 적 있어요
                    client.query('update wallet set wallet_coin_count=?, avg_buy_price=?, date=now() where id=? and coin_name=?', [Number(result[0].wallet_coin_count + trd_coin_cnt), Number(((result[0].avg_buy_price*result[0].wallet_coin_count) + (coin_price*trd_coin_cnt)) / (result[0].wallet_coin_count+trd_coin_cnt)), user_id, coin_name], (err) => {
                        console.log('산적 있어요', result[0].wallet_coin_count + trd_coin_cnt, ((result[0].avg_buy_price*result[0].wallet_coin_count) + (coin_price*trd_coin_cnt)) / (result[0].wallet_coin_count+trd_coin_cnt))
                        if(err) console.log(err);
                    })
                }
            })
        })
        res.send(`<script>alert("${coin_name} 매수 성공!"); history.back();</script>`);
    }
});

router.post('/sell', function(req, res, next){
    console.log(req.body);
    const user_have_coin = Number(req.body.coinCounts);
    const sell_price = Number(req.body.coin_value.replace(/,/g,""));
    const user_sell_coin = Number(req.body.user_coin);
    const coin_name = req.body.coin_name;
    if(user_have_coin < user_sell_coin) res.send("<script>alert('해당하는 양의 코인이 없습니다'); history.back();</script>")
    const total = 0.95 * sell_price * user_sell_coin;
    client.query('insert into trade(id, money, coin_name, trade_coin_count, action) values(?,?,?,?,"매도")',[
        req.session.userId, total, coin_name, user_sell_coin
    ],(err,data)=>{
        if(err) console.log(err);
        const changed_money = req.session.balance + total;
        client.query('update userdb set balance=? where id=?',[changed_money, req.session.userId],(err)=>{
            if(err) console.log(err);
            req.session.balance = changed_money;
            req.session.save();
        })
        client.query('select * from wallet where id=? and coin_name=?',[req.session.userId, coin_name],(err,data)=>{
            if(err) console.log(err);
            if(user_have_coin - user_sell_coin == 0){
                client.query('update wallet set wallet_coin_count=0, avg_buy_price=0, date=now() where id=? and coin_name=?',[req.session.userId, coin_name],(err)=>{if(err) console.log(err);});
            }else{
                client.query('update wallet set wallet_coin_count=?, date=now() where id=? and coin_name=?',[user_have_coin - user_sell_coin, req.session.userId, coin_name],(err)=>{if(err) console.log(err);})
            }
        })
    });
    res.send(`<script>alert("${coin_name} 매도 성공!"); history.back();</script>`);
});

router.post('/wallet', function(req, res, next){
    console.log('1111111111',req.body.coin);
    if(req.session.userId != undefined){
        client.query('select * from wallet where id=? and coin_name=?',[req.session.userId, req.body.coin],(err,data)=>{
            if(err) console.log(err);
            if(data != ""){
                res.send({result : data[0].wallet_coin_count});
            }else{
                res.send({result : 0});
            }
        })
    }
});

module.exports = router;