const { Server } = require("socket.io");
const {
  start_session,
  join_session,
  update_params,
  getMoviesForSession,
  add_to_liked_movies,
  end_session,
  leave_session,
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
    // console.log(sessionNameSpace.adapter.rooms);
    socket.on(
      "create-session",
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
        console.log(typeof session);
        socket.join(session.toString());
        cb({ session: session, admin: socket._id, error: error });
        console.log(`[CREATE_SESSION] Session Started by ${socket._id}`);
      }
    );
    socket.on("start-session", async ({ sessionID }) => {
      setTimeout(() => {
        socket.broadcast.to(sessionID).emit("session-started");
      }, 200);
      console.log("[START_SESSION] Session started by a user");
    });
    socket.on("join-session", async ({ sessionID }, cb) => {
      console.log(typeof sessionID);

      console.log(sessionNameSpace.adapter.rooms.get(sessionID));
      const { admin, error } = await join_session(sessionID, socket._id);
      cb({ admin, error });

      socket.join(sessionID);
      socket.broadcast.to(sessionID).emit("user-joined", socket._id);

      console.log(sessionNameSpace.adapter.rooms.get(sessionID));
      console.log(`[JOINED_SESSION] ${socket._id} joined the session`);
    });

    socket.on("update-params", async ({ sessionID, params }, cb) => {
      const result = await update_params(sessionID, params);
      cb(result);
      console.log(`[UPDATES_PARAMS] ${socket._id} updated the params`);
    });

    socket.on("get-movies", async ({ sessionID, currentIndex }, cb) => {
      const { movies, error } = await getMoviesForSession(
        sessionID,
        currentIndex
      );
      console.log(`[MOVIE_FETCHED] ${socket._id} fetched movies`);
      cb({ movies, error });
    });
    socket.on("add-liked-movies", async ({ sessionID, movieID }, cb) => {
      const { liked_by } = await add_to_liked_movies(
        socket._id,
        sessionID,
        movieID
      );
      let roomSize = sessionNameSpace.adapter.rooms.get(sessionID).size;
      if (liked_by === roomSize) {
        console.log("by all");
        sessionNameSpace.to(sessionID).emit("one-movie-liked-by-all");
      }
      console.log(`[MOVIE_LIKED] ${socket._id} liked ${movieID}`);
    });
    socket.on("end-session", async ({ groupID, sessionID }) => {
      await end_session(groupID);
      socket.broadcast.to(sessionID).emit("session-ended");

      console.log("[END_SESSION] Session ended");
    });
    socket.on("leave-session", async ({ sessionID }) => {
      await leave_session(sessionID);
      socket.broadcast.to(sessionID).emit("user-left", socket._id);
      console.log("[END_SESSION] Session ended");
    });
    socket.on("disconnect", () => {
      console.log("[DISCONNECTED] One user has left");
    });
  });
};

module.exports = socketApp;