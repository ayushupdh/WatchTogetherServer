const { Server } = require("socket.io");
const {
  start_session,
  join_session,
  update_params,
  getMoviesForSession,
  add_to_liked_movies,
  end_session,
  leave_session,
  makeSwipingActive,
} = require("./socket.helpers");

const socketApp = (app) => {
  const io = new Server(app);

  // Instantiate namespace for sessions handler
  const sessionNameSpace = io.of("/sessions");

  console.log("Socket Started");

  sessionNameSpace.on("connection", async (socket) => {
    console.log(
      `[CONNECTION] A new User connected Users: ${sessionNameSpace.sockets.size}`
    );

    // Set id once the socket is connected
    socket.on("set-id", ({ _id }) => {
      socket._id = _id;
      console.log(`[SETTING_ID] ID SET`);
    });
    // console.log(sessionNameSpace.adapter.rooms);

    // Create session handler
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
        socket.join(session.toString());
        cb({ session: session, admin: socket._id, error: error });
        socket.broadcast.emit("group-status-changed", groupID);
        console.log(`[CREATE_SESSION] Session Started by ${socket._id}`);
      }
    );

    // Add friends to group handler
    socket.on("friend-added-to-group", (sessionID) => {
      socket.broadcast.to(sessionID).emit("update-friendList");
    });

    // Remove friends to group handler
    socket.on("friend-removed-from-group", (sessionID) => {
      socket.broadcast.to(sessionID).emit("update-friendList");
    });

    // Start session in a group handler
    socket.on("start-session", async ({ sessionID }, cb) => {
      const time = await makeSwipingActive(sessionID);
      setTimeout(() => {
        socket.broadcast.to(sessionID).emit("session-started", time);
      }, 200);
      cb(time);
      console.log("[START_SESSION] Session started by a user");
    });

    // User joins a session handler
    socket.on("join-session", async ({ sessionID }, cb) => {
      const { admin, error } = await join_session(sessionID, socket._id);
      cb({ admin, error });

      socket.join(sessionID);
      socket.broadcast.to(sessionID).emit("user-joined", socket._id);
      console.log(`[JOINED_SESSION] ${socket._id} joined the session`);
    });

    // User updates params for movies handler
    socket.on("update-params", async ({ sessionID, params }, cb) => {
      const result = await update_params(sessionID, params);
      cb(result);
      socket.broadcast.to(sessionID).emit("time-updated", params.time);
      console.log(`[UPDATES_PARAMS] ${socket._id} updated the params`);
    });

    //  Handler for when user wants movies for the session
    socket.on("get-movies", async ({ sessionID, currentIndex }, cb) => {
      const { movies, error } = await getMoviesForSession(
        sessionID,
        currentIndex
      );
      console.log(`[MOVIE_FETCHED] ${socket._id} fetched movies`);
      cb({ movies, error });
    });

    //  Handler for when user likes a movie in a session
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

    //  Handler for when user ends a session
    socket.on("end-session", async ({ groupID, sessionID }) => {
      await end_session(groupID);
      socket.broadcast.to(sessionID).emit("session-ended");
      socket.broadcast.emit("group-status-changed", groupID);
      console.log("[END_SESSION] Session ended");
    });

    //  Handler for when user leaves a session
    socket.on("leave-session", async ({ sessionID }) => {
      await leave_session(sessionID, socket._id);
      socket.broadcast.to(sessionID).emit("user-left", socket._id);
      console.log(`[LEAVE_SESSION] ${socket._id} left ${sessionID}`);
    });

    //  Handler for when user is disconnecting
    socket.on("disconnecting", async () => {
      let j = socket.rooms.values();
      j.next();
      const sessionID = j.next().value;
      if (sessionID) {
        await leave_session(sessionID, socket._id);
        socket.broadcast.to(sessionID).emit("user-left", socket._id);
      }
    });
    socket.on("disconnect", () => {
      console.log("[DISCONNECTED] One user has left");
    });
  });
};

module.exports = socketApp;
