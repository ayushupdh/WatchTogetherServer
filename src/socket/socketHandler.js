const { Server } = require("socket.io");

const socketApp = (app) => {
  const io = new Server(app);

  const sessionNameSpace = io.of("/sessions");
  console.log("Socket Running");
  sessionNameSpace.on("connection", async (socket) => {
    console.log("[Connection] A new User connected");

    socket.on("start-session", () => {
      console.log("[START_SESSION] Session Started");
    });

    socket.on("end-session", () => {
      console.log("[END_SESSION] Session ended");
    });
    socket.on("disconnect", () => {
      console.log("[Disconnect] One user has left");
    });

    // const { username, roomId, password, action, options } = socket.handshake.query;
    // const room = new Room({ io: classicMode, socket, username, roomId, password, action, options });

    // const joinedRoom = await room.init(username);
    // consola.info('Client Connected');

    // if (joinedRoom) {
    //     room.showPlayers();
    //     room.isReady();
    //     room.shiftTurn();
    // }

    // room.onDisconnect();
  });
};

module.exports = socketApp;
