const app = require("./app");
const socket = require("./socket/socketHandler");
const port = process.env.PORT || 4000;

const server = require("http").createServer(app);

socket(server);

server.listen(port, () => {
  console.log("server starting on port : " + port);
});
