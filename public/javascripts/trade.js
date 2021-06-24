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

// 정적차트 가져오기
fetch(`http://127.0.0.1:9665/fetchAPI?endpoint=https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=1000`)
// fetch(`http://127.0.0.1:9665/fetchAPI?endpoint=https://api.upbit.com/v1/ticker?markets=KRW-BTC`)

  .then(res => res.json())
  .then(data => {
    const cdata = data.map(d => {
      return {time:d[0]/1000,open:parseFloat(d[1]),high:parseFloat(d[2]),low:parseFloat(d[3]),close:parseFloat(d[4])}
    });
    candleSeries.setData(cdata);
  })
  .catch(err => log(err));
  
const socket = io.connect('http://127.0.0.1:3000/');

socket.on('KLINE',(pl)=>{
    candleSeries.update(pl);
});

function chartSelector() {
    $('#chart_selector_btn').on("click", () => {
        const name = document.getElementById("chart_en_name_select").value;
        const time = document.getElementById("chart_time_select").value;
        console.log(name, time);
    });
}


/* ===COIN LIST==================================================================== */
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
                + (tickers[i].acc_trade_price_24h > 1000000 ? " 백만" : "") + "</td></tr>";
                rowHtml += "<tr><td>" + arr_market_name[i] + "</td>";

                $("#table_ticker > tbody:last").append(rowHtml);
            }
        });
    })
    .fail(function(){
        console.log("[ ERROR ] UPbit API connect error");
    });

    setTimeout(setUpbitData, 1000);
}

$(function() {
    setUpbitData();
    chartSelector();
});