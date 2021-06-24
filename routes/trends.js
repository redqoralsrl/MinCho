const express = require('express');
const ejs = require('ejs');
const client = require('./mysql');
const session = require('express-session');
const cheerio_httpcli = require('cheerio-httpcli');

const router = express.Router();

// 세션 (미들웨어)
router.use(session({
  secret: 'blackzat', // 데이터를 암호화 하기 위한 필요한 옵션
  resave: false, // 요청이 왔을 때 세션을 수정하지 않더라도 다시 저장소에 저장을 막기
  saveUninitialized: true, // 세션이 필요할 때 세션을 실행시킨다(서버에 부담을 줄인다)
}));

const url = 'https://finance.naver.com/marketindex/';
const param = {};
let result =[];
cheerio_httpcli.fetch(url,param,function(err,$,res,body){
  let WTI_img = "";
  let WTI_span = "";
  let WTI_change = "";
  let WTI_blind = "";
    $('#oilGoldList > li.on > a.graph_img > img').each(function(post){
        WTI_img = $(this).attr('src');
    })
    $('#oilGoldList > li.on > a.head.wti > div > span.value').each(function(post){
        WTI_span = $(this).text();
    })
    $('#oilGoldList > li.on > a.head.wti > div > span.change').each(function(post){
        WTI_change = $(this).text();
    })
    $('#oilGoldList > li.on > a.head.wti > div > span.blind').each(function(post){
        WTI_blind = $(this).text();
    })
    console.log('111111111',WTI_img);
    console.log('2222222',WTI_span);
    console.log('3333333', WTI_change);
    console.log('44444',WTI_blind);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.logined == true){
    res.render('trends',{
      logined : true,
      title : ejs.render('title')
    });
  }else{
    res.render('trends',{
      logined : false,
      title : ejs.render('title')
    });
  }
});

module.exports = router;
