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
        let nameId = "#"+paramName;
        const paramText = $(nameId).text();
        $('.viewchart').text('');
        $('.viewchart').text(paramText);
        $('#coin_name').val(paramText);
        $('#coin_name2').val(paramText);
        coinCount();
        $('#coinCounts').val(0);

        staticChart(paramTime, paramName);
        ticksInCurrentBar = 0;
        currentBar = {
            open: null,
            high: null,
            low: null,
            close: null,
            time: null
        }
    });
}

function timeToSec(paramTime) {
    let returnTime = 60;

    if(paramTime.indexOf("days") > -1)
        returnTime = 60*60*24; // 1days
    else if(paramTime.indexOf("weeks") > -1)
        returnTime = 60*60*24*7; // 1weeks
    else if(paramTime.indexOf("months") > -1)
        returnTime = 60*60*24*31; // 1months
    else if(paramTime.indexOf("minutes") > -1) {
        let temp = paramTime.split("/");
        returnTime = 60*temp[1]; // 1, 3, 5, 10, 15, 30, 60, 240
    }
    return returnTime;
}

/* ===STATIC CHART================================================================== */
const data = []; // 동적 차트 전용

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
    const sData = []; // 정적 차트 전용
    
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

        lastClose = data[data.length - 1].close;
        lastIndex = data.length - 1;
        currentIndex = lastIndex + 1;
    });
}

/* ===WebSocket===================================================================== */
function upbitWebSocket(selectTime, selectName) {
    
    $.ajax({
        url: "/upbitWS",
        type: "POST",
        dataType: "json",
        data: { "selectName": selectName },
        // async: false,
        // cache: false,
    })
    .done(function(result) {
        console.log("[ 클릭 ]   result.code== ", result.code, "slectName== ", selectName, result.timestamp);
        
        selectTime = timeToSec(selectTime);
        
        if(result.code != selectName) 
            console.log("달라 망할!");
        else if(result.code == selectName) {
            console.log("오예 같다");

            mergeTickToBar(result.trade_price, result.timestamp+15000);
            console.log("몇번째 찍는중? ", ticksInCurrentBar, "/", selectTime);

            if(++ticksInCurrentBar === selectTime) {
                currentIndex++;
                currentBar = {
                    open: null,
                    high: null,
                    low: null,
                    close: null,
                    // time: result.timestamp/1000,
                    time: result.timestamp+15000
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
    candleSeries.update({time: currentBar.time/1000, open: currentBar.open, high: currentBar.high, low: currentBar.low, close: currentBar.close});
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
                if(arr_english_name[i] == "Bitcoin Cash") {
                    arr_english_name[i] = "Timocoin";
                    arr_market_name[i] = "KRW-TMC";
                }

                // console.log('tlqkf',tickers[i]);

                // let rowHtml = `<tr><td id=\"list_${arr_english_name[i]}\">` + arr_english_name[i] + "</td>";
                // rowHtml += `<td rowspan=\"2\" id=\"${arr_english_name[i]}\">` + comma(tickers[i].trade_price)+"</td>";
                // rowHtml += "<td rowspan=\"2\">" + comma((tickers[i].signed_change_rate*100).toFixed(2))+"</td>";
                // rowHtml += "<td rowspan=\"2\">" 
                // + comma((tickers[i].acc_trade_price_24h > 1000000 ? ( tickers[i].acc_trade_price_24h / 1000000 ) : tickers[i].acc_trade_price_24h).toFixed(0)) 
                // + (tickers[i].acc_trade_price_24h > 1000000 ? "백만" : "") + "</td></tr>";
                // rowHtml += "<tr><td>" + arr_market_name[i] + "</td>";
                let rowHtml = `<tr><td id=\"list_${arr_english_name[i]}\" class="en_name">` + arr_english_name[i] + "<br/><em>" + arr_market_name[i] + "<em/></td>";
                rowHtml += `<td id=\"${arr_english_name[i]}\">` + comma(tickers[i].trade_price)+"</td>";
                rowHtml += "<td>" + comma((tickers[i].signed_change_rate*100).toFixed(2))+"</td>";
                rowHtml += "<td>" 
                + comma((tickers[i].acc_trade_price_24h > 1000000 ? ( tickers[i].acc_trade_price_24h / 1000000 ) : tickers[i].acc_trade_price_24h).toFixed(0)) 
                + (tickers[i].acc_trade_price_24h > 1000000 ? "백만" : "") + "</td></tr>";

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
                    $(".coin_value").html('');
                    $(".coin_before").html('');
                    $(".change_price").html('');
                    $(".coin_value").val(tickers[i].trade_price.toLocaleString('ko-KR'));
                    $(".coin_value").html(`${tickers[i].trade_price.toLocaleString('ko-KR')}`);
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

$(function() {
    chartSelector();
    setUpbitData();
    staticChart(paramTime, paramName);

    function callWS() {
        upbitWebSocket(paramTime, paramName);
    }
    
    setInterval(callWS, 1000);
});