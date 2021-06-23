// const express = require('express');
// const ejs = require('ejs');
// const request = require('request');
// const session = require('express-session');

// const router = express.Router();

// /* GET users listing. */
// router.get('/', function(req, res, next) {
//     if (req.session.logined == true) {
//         res.render('chart',{
//             title : ejs.render('title'),
//             logined: true,
//             // listchart : ejs.render('listchart')
//         });
//         }
//     else {
//         res.render('chart',{
//             title : ejs.render('title'),
//             logined: false,
//             // listchart : ejs.render('listchart')
//         });
//     }
// });

// router.get('/account', async(req, res, next) => {
//   const list = ["BTC","ETH","XRP","LTC","DOGE","BCH"];
//   const data = [];
//   var count = 0;
//   for(let i = 0; i < 6; i++){
//     request(`https://crix-api-endpoint.upbit.com/v1/crix/candles/days/?code=CRIX.UPBIT.KRW-${list[i]}`,function(err,response,body){
//       data.push(body);
//       count++;
//       if(count == 5) {
//         count = 0;
//         res.send({
//           data : data
//         });
//       }
//     })
//   }
// });

// module.exports = router;
