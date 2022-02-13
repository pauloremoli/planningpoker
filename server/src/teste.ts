const socket = require("socket.io-client")("https://localhost:4000", { secure: true, reconnection: true});

socket.on("connect_error", (err: any) => {
  console.log(`connect_error due to ${err.message}`);
});