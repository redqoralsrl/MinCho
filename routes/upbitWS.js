const express = require('express');
const router = express.Router();
const WebSocket = require('ws');

let recvData = "";

function upbitWebSocket(name) {
    let ws = new WebSocket("wss://api.upbit.com/websocket/v1");

    ws.on("open", () => {
        // console.log("upbit websocket 연결", name); // 잘 들어감
        const str = `[{"ticket":"find"},{"type":"ticker","codes":["${name}"]}]`;
        ws.send(str);
        ws.close();
    });

    ws.on("close", () => {
        // console.log("upbit websocket 연결끊김");
        // setTimeout(function() {
        //     console.log("upbit websocket 재접속");
        //     upbitWebSocket(name);
        // }, 2000);
    });

    ws.on('message', (data) => {
        try {
            let str = data.toString('utf-8');
            recvData = JSON.parse(str);
        } catch (error) {
            console.log(error);
        }
    });
}

router.post('/', function(req, res) {
    // console.log("자바에서 ajax 요청받음 ====>", req.body.selectName); // 잘 들어감
   
    upbitWebSocket(req.body.selectName); // 잘 들어감
    res.send(recvData);
    // console.log("실시간 api 결과값 ========>", recvData.code);
});

module.exports = router;
