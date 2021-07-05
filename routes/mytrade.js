const express = require('express');
const ejs = require('ejs');
const router = express.Router();
const session = require('express-session');
const client = require('./mysql');
const moment = require('moment');

router.use(session({
    secret: 'blackzat',
    resave: false,
    saveUninitialized: true, 
}));

router.get('/', function(req, res) {
    if(req.session.logined != true) {
        res.send("<script language=\"javascript\">alert('[ ERROR ] : Please Login'); location.replace('/login');</script>");
    } else {
        client.query("select * from userdb where id=?", [req.session.userId], (error, result1) => {
            client.query("select * from trade where id=? and coin_name is not null", [req.session.userId], (error, result2) => {
                client.query("select * from wallet where id=?", [req.session.userId], (error, result3) => {
                    let totalMoney = 0;

                    for(let i = 0; i < result3.length; i++) {
                        let temp =  result3[i].wallet_coin_count * result3[i].avg_buy_price;
                        totalMoney += temp;
                    }
                    res.render('mytrade',{
                        title : ejs.render('title'),
                        logined : true,
                        moment: moment,
                        balance: result1[0].balance,
                        trade: result2,
                        wallet: result3,
                        totalMoney: totalMoney,
                    });
                });
            });
        });
    }  
});

router.post('/recv', function(req, res) {
    client.query("select coin_name from wallet where id=?", [req.session.userId], (error, result) => {
        res.send(result);
    });
});

// router.post('/show', function(req, res) {
//     console.log("눈누난나나나나", data);
// });


module.exports = router;
