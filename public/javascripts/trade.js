/* ===COIN CHART==================================================================== */
const chartProperties = {
    width: 1000,
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
        const time = document.getElementById("chart_time_select").value;
        const name = document.getElementById("chart_en_name_select").value;

        staticChart(time, name);
    });
}

/* ===STATIC CHART================================================================== */
function staticChart(selectTime, selectName) {
    const time = [];
    const open = [];
    const high = [];
    const low = [];
    const close = [];
    const data = [];

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
    });
}


/* ===WebSocket===================================================================== */
function upbitWebSocket(selectTime, selectName) {
    $.ajax({
        url: "/upbitWS",
        type: "POST",
        dataType: "json",
        data: { "selectTime": selectTime, "selectName": selectName },
    })
    .done(function(result) {
        // console.log(result);
        console.log("뿌엥", result);
        candleSeries.update({
            time: Math.round(result.timestamp/1000), 
            open: parseFloat(result.opening_price), 
            high: parseFloat(result.high_price), 
            low: parseFloat(result.low_price), 
            close: parseFloat(result.trade_price)
        });
        // 실시간으로 잘 그려지는데 캔들이...이상함
        // 어떤 key값을 가져와야 하는 거지?
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

                let rowHtml = `<tr><td id=\"list_${arr_english_name[i]}\">` + arr_english_name[i] + "</td>";
                rowHtml += "<td rowspan=\"2\">" + comma(tickers[i].trade_price)+"</td>";
                rowHtml += "<td rowspan=\"2\">" + comma((tickers[i].signed_change_rate*100).toFixed(2))+"</td>";
                rowHtml += "<td rowspan=\"2\">" 
                + comma((tickers[i].acc_trade_price_24h > 1000000 ? ( tickers[i].acc_trade_price_24h / 1000000 ) : tickers[i].acc_trade_price_24h).toFixed(0)) 
                + (tickers[i].acc_trade_price_24h > 1000000 ? "million" : "") + "</td></tr>";
                rowHtml += "<tr><td>" + arr_market_name[i] + "</td>";

                $("#table_ticker > tbody:last").append(rowHtml);
            }
        });
    })
    .fail(function(){
        console.log("[ ERROR ] UPbit API connect error");
    });

    setTimeout(setUpbitData, 2000);
}

/* ===FUNC CALL===================================================================== */
$(function() {
    chartSelector();
    setUpbitData();
    staticChart("minutes/1", "KRW-BTC");
    // upbitWebSocket("5000", "KRW-BTC");
    function aa() {
        upbitWebSocket("5000", "KRW-BTC");
    }
    setInterval(aa, 3000);

});