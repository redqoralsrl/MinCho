/* ===COIN CHART==================================================================== */
const chartProperties = {
    width: 700,
    height: 400,
    timeScale:{
        timeVisible: true,
        secondVisible: false,
    }
}

const domElement = document.getElementById('chart');
const chart = LightweightCharts.createChart(domElement,chartProperties);
const candleSeries = chart.addCandlestickSeries();
let chartname = "KRW-BTC";
function chartSelector() {
    $('#chart_selector_btn').on("click", () => {
        const time = document.getElementById("chart_time_select").value;
        chartname = document.getElementById("chart_en_name_select").value;

        staticChart(time, chartname);
    });
}

/* ===STATIC CHART================================================================== */
const data = [];

var lastClose = '';
var lastIndex = '';
var currentIndex = '';
var ticksInCurrentBar = 0;
var tradeprice = '';
var tradetime = '';
var currentBar = {
    open: null,
    high: null,
    low: null,
    close: null,
    time: null
}

function staticChart(selectTime, selectName) {
    const time = [];
    const open = [];
    const high = [];
    const low = [];
    const close = [];

    $.ajax({
        url: `https://api.upbit.com/v1/candles/${selectTime}?market=${selectName}&count=200`,
        dataType: "json",
        async: false,
    })
    .done(function(datas) {
        for(let i = 0; i < datas.length; i++) {
            time[i] = datas[(datas.length-1)-i].timestamp/1000;
            open[i] = datas[(datas.length-1)-i].opening_price;
            high[i] = datas[(datas.length-1)-i].high_price;
            low[i] = datas[(datas.length-1)-i].low_price;
            close[i] = datas[(datas.length-1)-i].trade_price;
            data.push({time: time[i], open: open[i], high: high[i], low: low[i], close: close[i]});
        }
        
        const staticData = data.map((data) => {
            return {
                time: data.time, 
                open: data.open,
                high: data.high,
                low: data.low,
                close: data.close,
            }
        });

        candleSeries.setData(staticData);

        lastClose = data[data.length - 1].close;
        lastIndex = data.length - 1;
        currentIndex = lastIndex + 1;
    });
}

function mergeTickToBar(price, current_time) {
    if (currentBar.open === null) {
        currentBar.open = price;
        currentBar.high = price;
        currentBar.low = price;
        currentBar.close = price;
        currentBar.time = current_time;
    } else {
        currentBar.close = price;
        currentBar.high = Math.max(currentBar.high, price);
        currentBar.low = Math.min(currentBar.low, price);
    }
    candleSeries.update(currentBar);
}
/* ===WebSocket===================================================================== */
function upbitWebSocket(selectName) {
    $.ajax({
        url: "/upbitWS",
        type: "POST",
        dataType: "json",
        data: { "selectName": selectName },
    })
    .done(function(result) {
        // console.log(result);
        console.log("뿌엥", result);
        // candleSeries.update({
        //     time: Math.round(result.timestamp/1000), 
        //     open: result.trade_price,
        //     hight: result.trade_price,
        //     low: result.trade_price,
        //     close: result.trade_price,
        // });
        // 실시간으로 잘 그려지는데 캔들이...이상함
        // 어떤 key값을 가져와야 하는 거지?
        tradeprice = result.trade_price;
        tradetime = result.timestamp/1000;
    })
    .fail(function(){
        console.log("업비트 웹소켓 에러 ㅅㄱㅂㅇ");
    });
}


/* ===COIN LIST===================================================================== */
function comma(str) {
    str = String(str);
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

function matching(market, name) {
    const result = 
    market.indexOf("KRW") > -1
    && ( name.indexOf("비트코인") > -1 
    || market.indexOf("ETH") > -1
    || market.indexOf("LTC") > -1
    || market.indexOf("XRP") > -1 
    || market.indexOf("DOGE") > -1 )

    && market.indexOf("BTG") == -1
    && market.indexOf("BSV") == -1
    && market.indexOf("BCHA") == -1

    return result;
}

function setUpbitData(){
    $.ajax({
        url: "https://api.upbit.com/v1/market/all",
        dataType: "json"
    })
    .done(function(markets){
        let arr_markets = "";
        let arr_market_name = [];
        let arr_english_name = [];

        for(var i = 0; i < markets.length;i++){
            if(matching(markets[i].market, markets[i].korean_name)){
                arr_markets += markets[i].market+(",");
                arr_market_name.push(markets[i].market);
                arr_english_name.push(markets[i].english_name);
            }
        }
        arr_markets = arr_markets.substring(null, arr_markets.length-1);
        
        $.ajax({
            url: "https://api.upbit.com/v1/ticker?markets=" + arr_markets,
            dataType: "json"
        })
        .done(function(tickers){
            $("#table_ticker > tbody > tr").remove();
            for(let i = 0; i < tickers.length; i++){
                if(arr_english_name[i] == "Bitcoin Cash")
                    arr_english_name[i] = "Timocoin"
                console.log('tlqkf',tickers[i]);
                let rowHtml = `<tr><td id=\"list_${arr_english_name[i]}\">` + arr_english_name[i] + "</td>";
                rowHtml += `<td rowspan=\"2\" id=\"${arr_english_name[i]}\">` + comma(tickers[i].trade_price)+"</td>";
                rowHtml += "<td rowspan=\"2\">" + comma((tickers[i].signed_change_rate*100).toFixed(2))+"</td>";
                rowHtml += "<td rowspan=\"2\">" 
                + comma((tickers[i].acc_trade_price_24h > 1000000 ? ( tickers[i].acc_trade_price_24h / 1000000 ) : tickers[i].acc_trade_price_24h).toFixed(0)) 
                + (tickers[i].acc_trade_price_24h > 1000000 ? "million" : "") + "</td></tr>";
                rowHtml += "<tr><td>" + arr_market_name[i] + "</td>";

                $("#table_ticker > tbody:last").append(rowHtml);

                if($(".viewchart").text() == arr_english_name[i]){
                    if(tickers[i].change == "RISE"){
                        $(".showcoin").addClass('red');
                        $(".plu").html('');
                        $(".plu").html("+");
                        $(".arrow").html('');
                        $(".arrow").html(`<i class="fas fa-caret-up"></i>`);
                    }else if(tickers[i].change == "EVEN"){
                        $(".showcoin").addClass('black');
                        $(".plu").html('');
                        $(".plu").html('');
                        $(".arrow").html('');
                        $(".arrow").html(`<i class="fas fa-caret-left"></i>`);
                    }else{
                        $(".showcoin").addClass('blue');
                        $(".plu").html('');
                        $(".plu").html("-");
                        $(".arrow").html('');
                        $(".arrow").html(`<i class="fas fa-caret-down"></i>`);
                    }
                    $(".coin_value").html('');
                    $(".coin_before").html('');
                    $(".change_price").html('');
                    $(".coin_value").html(`${tickers[i].trade_price}`);
                    $(".coin_before").html(`${comma((tickers[i].signed_change_rate*100).toFixed(2))}%`);
                    $(".change_price").html(`${tickers[i].change_price}`);

                    $('.highprice').html('');
                    $('.lowprice').html('');
                    $('.highprice').html(`${tickers[i].high_price}`);
                    $('.lowprice').html(`${tickers[i].low_price}`);
                }
            }
        });
    })
    .fail(function(){
        console.log("[ ERROR ] UPbit API connect error");
    });

    setTimeout(setUpbitData, 1000);
}

/* ===FUNC CALL===================================================================== */
$(function() {
    chartSelector();
    setUpbitData();
    staticChart("minutes/1", chartname);
    function aa() {
        upbitWebSocket(chartname);  //이름 옵션으로 받기
    }
    setInterval(aa, 900);
    setInterval(function(){        
        mergeTickToBar(tradeprice, tradetime);
        if(++ticksInCurrentBar === 60){
            currentIndex++;
            currentBar = {
                open: null,
                high: null,
                low: null,
                close: null,
                time: tradetime,
            };
            ticksInCurrentBar = 0;
        }
    }, 1000);
});