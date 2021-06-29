const express = require('express');
const router = express.Router();
const WebSocket = require('ws');

let recvData = "";

function upbitWebSocket(name) {
    let ws = new WebSocket("wss://api.upbit.com/websocket/v1");

    ws.on("open", () => {
        console.log("upbit websocket 연결");
        const str = `[{"ticket":"find"},{"type":"ticker","codes":["${name}"]}]`;
        ws.send(str);
    });

    ws.on("close", () => {
        console.log("upbit websocket 연결끊김");
        setTimeout(function() {
            console.log("upbit websocket 재접속");
            upbitWebSocket(name);
        }, 1000);
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
    console.log("자바스크립트에서 ajax 요청받음 ====>", req.body.selectName);
   
    upbitWebSocket(req.body.selectName);
    res.send(recvData);
});

module.exports = router;
