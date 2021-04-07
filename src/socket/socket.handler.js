const { Server } = require("socket.io");
const {
  start_session,
  join_session,
  update_params,
} = require("./socket.helpers");
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

        cb({ session: "session", admin: "socket._id", error: null });

        console.log(`[START_SESSION] Session Started`);
      }
    );

    socket.on("join-session", async ({ sessionID }, cb) => {
      const result = await join_session(sessionID, socket._id);
      cb(result);

      console.log(`[JOINED_SESSION] ${socket._id} joined the session`);
    });
    socket.on("update-params", async ({ sessionID, params }, cb) => {
      const result = await update_params(sessionID, params);
      cb(result);

      console.log(`[UPDATES_PARAMS] ${socket._id} updated the params`);
    });

    socket.on("end-session", () => {
      console.log("[END_SESSION] Session ended");
    });
    socket.on("disconnect", () => {
      console.log("[DISCONNECTED] One user has left");
    });
  });
};

module.exports = socketApp;
