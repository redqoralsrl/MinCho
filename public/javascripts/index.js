var myIndex = 0;
carousel();

function carousel() {
    var i;
    var x = document.getElementsByClassName("mySlides");
    for (i = 0; i < x.length; i++) {
       x[i].style.display = "none";  
    }
    myIndex++;
    if (myIndex > x.length) {myIndex = 1}    
    x[myIndex-1].style.display = "block";  
    setTimeout(carousel, 3000);
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
                 rowHtml += "<td>" + arr_market_name[i] + "</td>";
                rowHtml += `<td id=\"${arr_english_name[i]}\">` + comma(tickers[i].trade_price)+"</td>";
                rowHtml += "<td>" + comma((tickers[i].signed_change_rate*100).toFixed(2))+"</td>";
                rowHtml += "<td>" 
                + comma((tickers[i].acc_trade_price_24h > 1000000 ? ( tickers[i].acc_trade_price_24h / 1000000 ) : tickers[i].acc_trade_price_24h).toFixed(0)) 
                + (tickers[i].acc_trade_price_24h > 1000000 ? "million" : "") + "</td></tr>";
                // rowHtml += "<tr><td>" + arr_market_name[i] + "</td>";

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
});
