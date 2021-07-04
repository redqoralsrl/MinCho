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
                    res.render('mytrade',{
                        title : ejs.render('title'),
                        logined : true,
                        moment: moment,
                        balance: result1[0].balance,
                        trade: result2,
                        wallet: result3,
                    });
                    console.log(result2.money);
                });
            });
        });
    }  
});


module.exports = router;
