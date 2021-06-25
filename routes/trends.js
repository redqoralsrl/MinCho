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

// 코인리더스 크롤링
let url3 = 'https://www.coinreaders.com/sub_view.html'; 
var param3 = {};
let result3 = [];
cheerio_httpcli.fetch(url3, param3, function (err, $, res) {
  if (err) { 
      console.log(err); 
      return; 
  }
  
  let cr_img='', cr_title='', cr_link='', cr_context='', cr_writer='';

  for(let i = 1; i <= 10; i++) {
    cr_img = $('#news_list2_area > .news_list:nth-child('+i+') > dl > dt > a.link > img').attr('src');
    cr_img = cr_img.substring(1, cr_img.length);
    cr_title = $('#news_list2_area > .news_list:nth-child('+i+') > dl > dd.title > a.link').text();
    cr_link = $('#news_list2_area > .news_list:nth-child('+i+') > dl > dd.title > a.link').attr('href');
    cr_context = $('#news_list2_area > .news_list:nth-child('+i+') > dl > dd.body > a.link').text();
    cr_writer = $('#news_list2_area > .news_list:nth-child('+i+') > dl > dd.write > a.link').text();
    result3[i-1] = {
      cr_img : cr_img,
      cr_title : cr_title,
      cr_link: cr_link,
      cr_context : cr_context,
      cr_writer : cr_writer
    }
  }
});

//블록미디어 크롤링
// let url3 = 'https://www.blockmedia.co.kr/'; 
// var param3 = {};
// cheerio_httpcli.fetch(url3, param3, function (err, $, res) {
//     if (err) { 
//         console.log(err); 
//         return; 
//     }

//     let bm_img=[];
//     let bm_title=[];
//     let bm_context=[];
//     $("#post-183069 > div.header > a > img").each(function (post) { 
//       bm_img.push($(this).attr('src'));
//     });
//     $('#post-183069 > div.post-content > h2 > a').each(function(post){
//       bm_title.push($(this).text());
//     });
//     $('#post-183069 > div.post-content > div.post-meta.vcard > p > a:nth-child(1)').each(function(post){
//       bm_context.push($(this).text());
//     });
//     console.log('bm_img', bm_img);
//     console.log('bm_title', bm_title);
//     console.log('bm_title', bm_context);
// });

//코인데스크 크롤링
// let url4 = 'https://www.coindeskkorea.com/'; 
// var param4 = {};
// cheerio_httpcli.fetch(url4, param4, function (err, $, res) {
//     if (err) { 
//         console.log(err); 
//         return; 
//     }

//     let cd_img='';
//     let cd_title='';
//     let cd_context='';
//     cd_img = $("#moreList > li:nth-child(3) > div > a > em").attr('style');
//     // cd_img = cd_img.split( '(' , 2)[1];
//     cd_img = cd_img.substring(21, cd_img.length-1);
//     $('#moreList > li:nth-child(3) > div > span > a:nth-child(2) > strong').each(function(post){
//       cd_title = $(this).text();
//     });
//     $('#moreList > li:nth-child(3) > div > span > a:nth-child(2) > span.auto-sums.font-gulim.size-12.line-8x2.auto-fontM').each(function(post){
//       cd_context = $(this).text();
//     });
//     console.log('cd_img', cd_img);
//     console.log('cd_img_size', cd_img.length);
//     console.log('cd_title', cd_title);
//     console.log('cd_context', cd_context);
// });

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.logined == true){
    res.render('trends',{
      logined : true,
      title : ejs.render('title'),
      cr_news : result3,
      result : result,
      news_notice : news_notice,
    });
  }else{
    res.render('trends',{
      logined : false,
      title : ejs.render('title'),
      cr_news : result3,
      result : result,
      news_notice : news_notice,
    });
  }
});

module.exports = router;
