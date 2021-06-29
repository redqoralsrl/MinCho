const express = require("express");
const ejs = require("ejs");
const router = express.Router();
const client = require("./mysql");
const session = require("express-session");

router.use(
  session({
    secret: "blackzat", // 데이터를 암호화 하기 위한 필요한 옵션
    resave: false, // 요청이 왔을 때 세션을 수정하지 않더라도 다시 저장소에 저장을 막기
    saveUninitialized: true, // 세션이 필요할 때 세션을 실행시킨다(서버에 부담을 줄인다)
  })
);

// router.get("/", function (req, res, next) {
//   if (req.session.logined == true) {
//     res.render("wallet", {
//       logined: true,
//       title: ejs.render("title"),
//     });
//   } else {
//     res.render("wallet", {
//       logined: false,
//       title: ejs.render("title"),
//     });
//   }
// });

router.get("/", (req, res) => {
  if(req.session.logined != true){
    res.send('<script>alert("로그인 후 이용해주세요"); location.replace("/login");</script>')
  }else{
    client.query(
      "select * from wallet where id=? order by num desc;",
      [req.session.userId],
      (err, data) => {
        if(err) console.log(err);
        console.log(data)
        res.render("wallet", {
          logined: true,
          id: req.session.userId,
          name: req.session.name,
          balance: req.session.balance,
          wallet : data,
          // withdraw_deposit: req.session.withdraw_deposit,
          // date : req.session.date,
          // amount_money:req.session.amount_money,
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
  var name = req.session.name;
  var withdraw_deposit = "입금";
  var amount = req.body.amount_money;
  client.query("select * from userdb where id=?", [id], (err, data) => {
    const user_balance = data[0].balance;
    // console.log('user돈',user_balance);
    const result_balance = parseInt(user_balance) + parseInt(amount);
    var datas = [id, name, amount, result_balance, withdraw_deposit];
    var sql =
      "insert into wallet (id,name,amount_money,balance,withdraw_deposit,date) values(?,?,?,?,?,now())";
    client.query(sql, datas, function (err, row) {
      client.query(
        "update userdb set balance=? where id=?",
        [result_balance, id],
        (err, data) => {
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
  var name = req.session.name;
  var withdraw_deposit = "출금";
  var amount = req.body.amount_money;
  client.query("select * from userdb where id=?", [id], (err, data) => {
    const user_balance = data[0].balance;
    // console.log('user돈',user_balance);
    const result_balance = parseInt(user_balance) - parseInt(amount);
    var datas = [id, name, amount, result_balance, withdraw_deposit];
    var sql =
      "insert into wallet (id,name,amount_money,balance,withdraw_deposit,date) values(?,?,?,?,?,now())";
    client.query(sql, datas, function (err, row) {
      client.query(
        "update userdb set balance=? where id=?",
        [result_balance, id],
        (err, data) => {
          if (err) console.error("err: " + err);
          res.redirect("/wallet");
        }
      );
    });
  });
});

module.exports = router;
