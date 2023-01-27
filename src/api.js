const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const WebSocket = require("ws");
const serverless = require("serverless-http");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

const coinList = ["btctry", "atomtry", "dogetry"];

const router = express.Router();

io.on("connection", (socket) => {
  console.log(`Yeni bir bağlantı : ${socket.id}`);
});

const TickerSocket = (coin) => {
  const tickerWS = new WebSocket(
    "wss://stream.binance.com:9443/ws/" + coin.toLowerCase() + "@ticker"
  );
  tickerWS.on("message", function incoming(data) {
    const coinTicker = JSON.parse(data);
    io.emit(coin.toLowerCase(), coinTicker);
  });
};

router.get("/", (req, res) => {
  for (const item of coinList) {
    TickerSocket(item);
  }
});

router.get("/test", (req, res) => {
  res.json({ message: "test" });
});

server.listen(4050, () => {
  console.log("Sunucu 4050 portunda çalışıyor!");
});

app.use("/.netlify/functions/api", router);

module.exports = app;
module.exports.handler = serverless(app);
