const { Server } = require("socket.io");
const { start_session, join_session } = require("./sockethelpers");
const socketApp = (app) => {
  const io = new Server(app);

  const sessionNameSpace = io.of("/sessions");

  console.log("Socket Started");

  sessionNameSpace.on("connection", async (socket) => {
    console.log(
      `[CONNECTION] A new User connected Users: ${sessionNameSpace.sockets.size}`
    );
    socket.once("set-id", ({ _id }) => {
      socket._id = _id;
      console.log(`[SETTING_ID] ID SET`);
    });

    socket.on(
      "start-session",
      async (
        { groupID, current_session_time, genres, lang, providers },
        cb
      ) => {
        const { session, error } = await start_session(
          groupID,
          socket._id,
          current_session_time,
          genres,
          lang,
          providers
        );

        cb({ session, error });

        console.log(`[START_SESSION] Session Started`);
      }
    );

    socket.on(
      "join-session",
      async (
        { groupID, current_session_time, genres, lang, providers },
        cb
      ) => {
        const { session, error } = await join_session(
          sessionID,
          socket._id,
          genres,
          lang,
          providers
        );

        cb({ session, error });

        console.log(`[JOINED_SESSION] A user joined the session`);
      }
    );

    socket.on("end-session", () => {
      console.log("[END_SESSION] Session ended");
    });
    socket.on("disconnect", () => {
      console.log("[DISCONNECTED] One user has left");
    });
  });
};

module.exports = socketApp;
