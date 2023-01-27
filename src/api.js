const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const WebSocket = require("ws");
const serverless = require("serverless-http");
const cors = require("cors");

const app = express();
const router = express.Router();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "<http://localhost:4000>",
    methods: ["GET", "POST"],
  },
});

const PORT = 4000;

app.use(cors());

// const coinList = ["btctry", "atomtry", "dogetry"];

io.on("connection", (socket) => {
  console.log(`Yeni bir socket bağlantısı : ${socket.id}`);

  socket.on("getData", (coin) => {
    const tickerWS = new WebSocket(
      "wss://stream.binance.com:9443/ws/" + coin.toLowerCase() + "@ticker"
    );
    tickerWS.on("message", (data) => {
      const coinTicker = JSON.parse(data);
      socket.emit(coin.toLowerCase(), coinTicker);
    });
  });

  socket.on("disconnect", () => {
    console.log("Bir kullanıcı ayrıldı: " + socket.id);
  });
});

/*
const TickerSocket = (coin) => {
  const tickerWS = new WebSocket(
    "wss://stream.binance.com:9443/ws/" + coin.toLowerCase() + "@ticker"
  );
  tickerWS.on("message", (data) => {
    const coinTicker = JSON.parse(data);
    io.emit(coin.toLowerCase(), coinTicker);
  });
};
*/

router.get("/", (req, res) => {
  res.json({ message: "Socket IO active!" });
});

server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor!`);
});

app.use("/.netlify/functions/api", router);

module.exports = app;
module.exports.handler = serverless(app);
