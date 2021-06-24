const express = require('express');
const router = express.Router();
const ejs = require('ejs');

router.get('/', function(req, res, next) {
    if (req.session.logined == true) {
        res.render('trade', {
            logined: true,
            title : ejs.render('title'),
        });
    }
    else {
        res.render('trade',{
            logined : false,
            title : ejs.render('title'),
        });
    }
});

// const request = require('request');
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

module.exports = router;
