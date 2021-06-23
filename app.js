const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const api = require('binance'); // npm i github:karthik947/binance#master
const session = require('express-session');

const indexRouter = require('./routes/index');
const chartRouter = require('./routes/chart');
const supportRouter = require('./routes/support');
const listRouter = require('./routes/list');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/chart', chartRouter);
app.use('/support', supportRouter);
app.use('/list', listRouter);

// 세션 (미들웨어)
app.use(session({
  secret: 'blackzat', // 데이터를 암호화 하기 위한 필요한 옵션
  resave: false, // 요청이 왔을 때 세션을 수정하지 않더라도 다시 저장소에 저장을 막기
  saveUninitialized: true, // 세션이 필요할 때 세션을 실행시킨다(서버에 부담을 줄인다)
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.io = require('socket.io')();
const bRest = new api.BinanceRest({
  key: "0KZ4HYFWpiuuk1QrSlf9HE9Al4U3KSiY2JRkZEaQPGBxRVAXHnL7tDuIeucCJzQV", // Get this from your account on binance.com
  secret: "pJcBbnAaVhxv2uB5u6N2imQkbHFCXwmbljULgkmnaTj5cQtJaAjJEhycpJFzrGzq", // Same for this
  timeout: 15000, // Optional, defaults to 15000, is the request time out in milliseconds
  recvWindow: 20000, // Optional, defaults to 5000, increase if you're getting timestamp errors
  disableBeautification: false,
  handleDrift: true
});
const binanceWS = new api.BinanceWS(true);
const bws = binanceWS.onKline('BTCUSDT', '1m', (data) => {
  app.io.sockets.emit('KLINE',{time:Math.round(data.kline.startTime/1000),open:parseFloat(data.kline.open),high:parseFloat(data.kline.high),low:parseFloat(data.kline.low),close:parseFloat(data.kline.close)});
});

module.exports = app;
