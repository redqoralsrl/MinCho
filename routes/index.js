const express = require('express');
const ejs = require('ejs');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{
    title : ejs.render('title')
  });
});

router.get('/login', function(req, res, next){
  res.render('login',{
    title : ejs.render('title')
  })
});

module.exports = router;
