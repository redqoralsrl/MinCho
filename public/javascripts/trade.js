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

function chartSelector() {
    $('#chart_selector_btn').on("click", () => {
        paramTime = document.getElementById("chart_time_select").value;
        paramName = document.getElementById("chart_en_name_select").value;

        // timeToSec(paramTime);
        staticChart(paramTime, paramName);
        // upbitWebSocket(paramName);
    });
}

/* ===STATIC CHART================================================================== */
const data = [];

var lastClose = '';
var lastIndex = '';
var currentIndex = '';
var ticksInCurrentBar = 0;
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
    const sData = []; // data 최상으로 빼면 정적 차트 select 안 먹힘
    
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
            sData.push({time: time[i], open: open[i], high: high[i], low: low[i], close: close[i]});
            data.push({time: time[i], open: open[i], high: high[i], low: low[i], close: close[i]});
        }
        
        const staticData = sData.map((sData) => {
            return {
                time: sData.time, 
                open: sData.open,
                high: sData.high,
                low: sData.low,
                close: sData.close,
            }
        });

        candleSeries.setData(staticData);

        // data = sData; // 안 됨
        lastClose = data[data.length - 1].close; // sData로 넣으면 에러뜸
        lastIndex = data.length - 1;
        currentIndex = lastIndex + 1;
    });
}

/* ===WebSocket===================================================================== */
// function upbitWebSocket(selectName, dynamicTime) {
function upbitWebSocket(selectName) {
    
    $.ajax({
        url: "/upbitWS",
        type: "POST",
        dataType: "json",
        data: { "selectName": selectName },
        // async: false,
        // cache: false,
    })
    .done(function(result) {
        // const tradeprice = result.trade_price;
        // const tradetime = result.timestamp/1000;

        console.log("[ 클릭 ]   result.code== ", result.code, "slectName== ", selectName, result.timestamp);

        if(result.code != selectName) 
            console.log("달라 시발!");
        else if(result.code == selectName) {
            console.log("오예 같다");
            // mergeTickToBar(tradeprice, tradetime);
            // mergeTickToBar(result.trade_price, result.timestamp/1000);
            mergeTickToBar(result.trade_price, result.timestamp);
            // if(++ticksInCurrentBar === dynamicTime) {
            if(++ticksInCurrentBar === 5) {
                currentIndex++;
    
                currentBar = {
                    open: null,
                    high: null,
                    low: null,
                    close: null,
                    // time: result.timestamp/1000,
                    time: result.timestamp,
                };
                ticksInCurrentBar = 0;
            }
        }
        else console.log("둘 다 아니면 무 ㅓㄴ데");
    })
    .fail(function(){
        console.log("업비트 웹소켓 에러");
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
    // candleSeries.update(currentBar);
    console.log(currentBar.time, "sdsdsdsd");
    candleSeries.update({time: currentBar.time, open: currentBar.open, high: currentBar.high, low: currentBar.low, close: currentBar.close});
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

                // console.log('tlqkf',tickers[i]);

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
                        // $(".plu").html("-");
                        $(".arrow").html('');
                        $(".arrow").html(`<i class="fas fa-caret-down"></i>`);
                    }
                    // $(".coin_value").html('');
                    $(".coin_before").html('');
                    $(".change_price").html('');
                    $(".coin_value").val(tickers[i].trade_price.toLocaleString('ko-KR'));
                    // $(".coin_value").html(`${tickers[i].trade_price.toLocaleString('ko-KR')}`);
                    $(".coin_before").html(`${comma((tickers[i].signed_change_rate*100).toFixed(2))}%`);
                    $(".change_price").html(`${tickers[i].change_price.toLocaleString('ko-KR')}`);

                    $('.highprice').html('');
                    $('.lowprice').html('');
                    $('.highprice').html(`${tickers[i].high_price.toLocaleString('ko-KR')}`);
                    $('.lowprice').html(`${tickers[i].low_price.toLocaleString('ko-KR')}`);
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
let paramName = "KRW-BTC";
let paramTime = "minutes/1";
// let dynamicTime = 60;

// function timeToSec(paramTime) {
//     if(paramTime.indexOf("days") > -1)
//         dynamicTime = 60*60*24; // 1days
//     else if(paramTime.indexOf("weeks") > -1)
//         dynamicTime = 60*60*24*7; // 1weeks
//     else if(paramTime.indexOf("months") > -1)
//         dynamicTime = 60*60*24*31; // 1months
//     else if(paramTime.indexOf("minutes") > -1) {
//         let temp = paramTime.split("/");
//         dynamicTime = temp[1]; // 1, 3, 5, 10, 15, 30, 60, 240
//     }
// }

$(function() {
    chartSelector();
    setUpbitData();
    staticChart(paramTime, paramName);

    function callWS() {
        // upbitWebSocket(paramName, dynamicTime);
        upbitWebSocket(paramName);
    }
    
    setInterval(callWS, 3000);

    /* 잘 됐던거 같은데 갑자기 에러 뜸 ==> upbitWebSocket 안으로 삽입
    setInterval(callWS, 900);
    setInterval(function() {        
        mergeTickToBar(tradeprice, tradetime);
        if(++ticksInCurrentBar === 3) {
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
    */
});