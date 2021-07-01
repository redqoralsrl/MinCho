const express = require('express');
const ejs = require('ejs');
const router = express.Router();
// 세션 포함하기

router.get('/', function(req, res, next) {
  if(req.session.logined == true){
    res.render('mytrade',{
      logined : true,
      title : ejs.render('title')
    });
  }else{
    res.render('mytrade',{
      logined : false,
      title : ejs.render('title')
    });
  }  
});

module.exports = router;
