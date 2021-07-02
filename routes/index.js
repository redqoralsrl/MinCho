const express = require('express');
const ejs = require('ejs');
const crypto = require('crypto');
const client = require('./mysql');
const session = require('express-session');

const router = express.Router();

// 세션 (미들웨어)
router.use(session({
  secret: 'blackzat', // 데이터를 암호화 하기 위한 필요한 옵션
  resave: false, // 요청이 왔을 때 세션을 수정하지 않더라도 다시 저장소에 저장을 막기
  saveUninitialized: true, // 세션이 필요할 때 세션을 실행시킨다(서버에 부담을 줄인다)
}));



/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.logined == true){
    res.render('index',{
      logined : true,
      title : ejs.render('title')
    });
  }else{
    res.render('index',{
      logined : false,
      title : ejs.render('title')
    });
  }
  
});

router.get('/login', function(req, res, next){
  res.render('login',{
    logined : false,
    title : ejs.render('title')
  });
});

router.post('/login', function(req, res, next){
  const body = req.body;
  const id = body.id;
  const pw = body.pw;
  const pass_cry = crypto.createHash('sha512').update(pw).digest('base64');
  client.query('select * from userdb where id=?',[id],(err,data)=>{
    if(err) console.log(err);
    if(data != ""){
      if(data[0].id == id && data[0].pw == pass_cry){
        console.log("data[0] ==>",data[0])
        req.session.userId = data[0].id;
        req.session.pw = data[0].pw;
        req.session.name = data[0].name;
        req.session.balance = data[0].balance;
        // req.session.amount_money = data[0].amount_money;
        // req.session.withdraw_deposit = data[0].withdraw_deposit;
        // req.session.date = data[0].date;
        req.session.logined = true;
        req.session.save();
        console.log('로그인... ==>',req.session);
        res.render('index',{
          logined : true,
          title : ejs.render('title')
          
        });
      }else{
        res.send('<script>alert("아이디 비밀번호 불일치!");history.back();</script>');
      }
    }else{
      res.send('<script>alert("가입하신 정보가 없습니다. 가입해주세요!");history.back();</script>');
    }
  })
});

router.post('/register', function(req, res, next){
  const body = req.body;
  const id = body.id;
  const name = body.name;
  const pw = body.pw;
  const pass_cry = crypto.createHash('sha512').update(pw).digest('base64');
  client.query('select * from userdb where id=?',[id],(err,data)=>{
    if(err) console.log(err);
    console.log(data);
    if(data == ""){
      client.query('insert into userdb(id,name,pw) values(?,?,?)',[id, name, pass_cry],(err)=>{
        if(err) console.log(err);
        res.redirect('/login');
      });
    }else{
      res.send('<script>alert("ID is already use!");history.back();</script>');
    }
  })
});

router.get('/logout',(req,res)=>{
  const cookied = req.session.id;
  req.session.destroy(function(err){
    res.clearCookie(cookied);
    res.redirect('/');
  });
});

module.exports = router;
