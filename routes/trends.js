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

// 그래프 크롤링
const url = 'https://finance.naver.com/marketindex/';
const param = {};
let result = [];
cheerio_httpcli.fetch(url,param,function(err,$,res,body){
  let data = [];
  let WTI_img = "", WTI_span = "", WTI_change = "", WTI_blind = "", WTI_name = "";
  // WTI
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
    $('#oilGoldList > li.on > a.head.wti > h3').each(function(post){
        WTI_name = $(this).text();
    })
    data.push(WTI_img);
    data.push(WTI_span);
    data.push(WTI_change);
    data.push(WTI_blind);
    data.push(WTI_name);
    result.push(data);
    data = [];
  // 달러 / 일본 엔
    $('#worldExchangeList > li.on > a.graph_img > img').each(function(post){
        WTI_img = $(this).attr('src');
    })
    $('#worldExchangeList > li.on > a.head.jpy_usd > div > span.value').each(function(post){
        WTI_span = $(this).text();
    })
    $('#worldExchangeList > li.on > a.head.jpy_usd > div > span.change').each(function(post){
        WTI_change = $(this).text();
    })
    $('#worldExchangeList > li.on > a.head.jpy_usd > div > span.blind').each(function(post){
        WTI_blind = $(this).text();
    })
    $('#worldExchangeList > li.on > a.head.jpy_usd > h3').each(function(post){
        WTI_name = $(this).text();
    })
    data.push(WTI_img);
    data.push(WTI_span);
    data.push(WTI_change);
    data.push(WTI_blind);
    data.push(WTI_name);
    result.push(data);
    data = [];
    // 미국 USD
    $('#exchangeList > li.on > a.graph_img > img').each(function(post){
        WTI_img = $(this).attr('src');
    })
    $('#exchangeList > li.on > a.head.usd > div > span.value').each(function(post){
        WTI_span = $(this).text();
    })
    $('#exchangeList > li.on > a.head.usd > div > span.change').each(function(post){
        WTI_change = $(this).text();
    })
    $('#exchangeList > li.on > a.head.usd > div > span.blind').each(function(post){
        WTI_blind = $(this).text();
    })
    $('#exchangeList > li.on > a.head.usd > h3').each(function(post){
        WTI_name = $(this).text();
    })
    data.push(WTI_img);
    data.push(WTI_span);
    data.push(WTI_change);
    data.push(WTI_blind);
    data.push(WTI_name);
    result.push(data);
});

// 뉴스 공지사항 크롤링
const url2 = 'https://www.coinreaders.com/index.html';
let news_notice = [];
cheerio_httpcli.fetch(url2,param,function(err,$,res,body){
  let news = "", news1 = "";
  for(let i = 2; i < 7; i++){
    $(`#contents > div > div > center > div.main2_coin_sise > div > div:nth-child(${i}) > dl > dt > a`).each(function(post){
      news = $(this).text();
    })
    news_notice.push(news);
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.logined == true){
    res.render('trends',{
      logined : true,
      result : result,
      news_notice : news_notice,
      title : ejs.render('title')
    });
  }else{
    res.render('trends',{
      logined : false,
      result : result,
      news_notice : news_notice,
      title : ejs.render('title')
    });
  }
});

module.exports = router;
