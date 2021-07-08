const express = require("express");
const ejs = require("ejs");
const router = express.Router();
const client = require("./mysql");
const session = require("express-session");
const moment = require('moment');
router.use(
  session({
    secret: "blackzat", // 데이터를 암호화 하기 위한 필요한 옵션
    resave: false, // 요청이 왔을 때 세션을 수정하지 않더라도 다시 저장소에 저장을 막기
    saveUninitialized: true, // 세션이 필요할 때 세션을 실행시킨다(서버에 부담을 줄인다)
  })
);



router.get("/", (req, res) => {
  if(req.session.logined != true){
    res.send('<script>alert("로그인 후 이용해주세요"); location.replace("/login");</script>')
  }else{
    client.query(
      "select * from trade where id=? order by num desc; select * from wallet where id=?; select * from userdb where id=?",
      [req.session.userId, req.session.userId, req.session.userId],
      (err, data) => {
        if(err) console.log(err);
        coin = ["Bitcoin", "Ethereum", "Litecoin", "Ripple", "Timocoin", "Dogecoin"];
        res.render("wallet", {
          logined: true,
          id: req.session.userId,
          name: req.session.name,
          balance: data[2][0].balance,
          trade : data[0],
          wallet : data[1],
          coin : coin,
          moment: moment,
          title: ejs.render("title"),
        });
      }
    ); 
  }
});

//입금
router.post("/deposit", function (req, res, next) {
  //   const balance = req.body.balance;
  var id = req.session.userId;
  var balance = req.session.balance;
  // var name = req.session.name;
  var action  = "입금";
  var money = req.body.money;
  
  client.query("select * from userdb where id=?", [id], (err, data) => {
    let user_balance = data[0].balance;
    // console.log('user돈',user_balance);
    let result_balance = parseInt(user_balance) + parseInt(money);
    var datas = [id, money, action];
    var sql =
      "insert into trade (id,money,action,date) values(?,?,?,now())";
    client.query(sql, datas, function (err, row) {

      client.query(
        "update userdb set balance=? where id=?",
        [result_balance, id],
        (err, row) => {
          req.session.balance = result_balance;
          req.session.save();
          if (err) console.error("err: " + err);
          res.redirect("/wallet");
        }
      );
    });
  });
});

//출금
router.post("/withdraw", function (req, res, next) {
  var id = req.session.userId;
  var balance = req.session.balance;
  // var name = req.session.name;
  var action = "출금";
  var money = req.body.money;

  client.query("select * from userdb where id=?", [id], (err, data) => {
    const user_balance = data[0].balance;

    // console.log('user돈',user_balance);
    const result_balance = parseInt(user_balance) - parseInt(money);
    if (result_balance < 0) {
      res.send('<script>alert("잔액이 부족합니다");history.back();</script>');
    }
    else {
      var datas = [id, money, action];
      var sql =
        "insert into trade (id,money,action,date) values(?,?,?,now())";
      client.query(sql, datas, function (err, row) {
        client.query(
          "update userdb set balance=? where id=?",
          [result_balance, id],
          (err, row) => {
            req.session.balance = result_balance;
            req.session.save();
            if (err) console.error("err: " + err);
            res.redirect("/wallet");
          }
        );
      });
    };
  });
});

module.exports = router;
