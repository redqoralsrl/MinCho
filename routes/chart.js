const express = require('express');
const ejs = require('ejs');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('chart',{
    title : ejs.render('title')
  });
});

module.exports = router;
