const app = require("./app");
const socket = require("./socket/socket.handler");
const port = process.env.PORT || 4000;

// Create server to start with express
const server = require("http").createServer(app);

// Add socket listeners
socket(server);

server.listen(port, () => {
  console.log("server starting on port : " + port);
});
