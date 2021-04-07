const { Server } = require("socket.io");
const {
  start_session,
  join_session,
  update_params,
  getMoviesForSession,
  add_to_liked_movies,
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
        console.log(typeof session);
        socket.join(session.toString());
        cb({ session: session, admin: socket._id, error: error });
        console.log(`[START_SESSION] Session Started by ${socket._id}`);
      }
    );

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
        socket.to(sessionID).emit("one-movie-liked-by-all");
      }
      console.log(`[MOVIE_LIKED] ${socket._id} liked ${movieID}`);
    });
    // socket.on("add-disliked-movies", async ({ sessionID, movieID }, cb) => {
    //   const result = await add_to_disliked_movies(
    //     socket._id,
    //     sessionID,
    //     movieID
    //   );
    //   cb(result);
    //   console.log(`[MOVIE_DISLIKED] ${socket._id} liked ${movieID}`);
    // });
    socket.on("end-session", () => {
      console.log("[END_SESSION] Session ended");
    });
    socket.on("disconnect", () => {
      console.log("[DISCONNECTED] One user has left");
    });
  });
};

module.exports = socketApp;
