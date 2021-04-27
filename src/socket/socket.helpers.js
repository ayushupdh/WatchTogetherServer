const { isValidObjectId } = require("mongoose");
const Group = require("../models/group");
const User = require("../models/user");
const Movie = require("../models/movies");

const Session = require("../models/session");

// Function to create a new session
const start_session = async (
  groupID,
  userID,
  current_session_time,
  genres,
  lang,
  providers
) => {
  let session = null;
  let error = null;

  try {
    console.log({ groupID, userID, current_session_time });
    if (
      !groupID ||
      !userID ||
      current_session_time === null ||
      current_session_time === undefined
    ) {
      throw new Error("Params do not match");
    }

    if (!isValidObjectId(groupID) || !isValidObjectId(userID)) {
      throw new Error("Invalid Object ID");
    }

    const groupExists = await Group.findById(groupID);
    const userExists = await User.findById(userID);
    if (!groupExists) {
      throw new Error("Group Not Found");
    }
    if (!userExists) {
      throw new Error("User Not Found");
    }

    const session = await Session.create({
      groupID,
      admin: userID,
      active_users: [userID],
      current_session_time: current_session_time,
      params: { genre: genres, platform: providers, lang },
    });

    await Group.findByIdAndUpdate(groupID, {
      session_active: true,
      $addToSet: { sessions: session._id },
    });

    return { session: session._id, error };
  } catch (e) {
    console.log(e);
    return { session, error: e.message };
  }
};

// Function to add a user to a session
const join_session = async (sessionID, userID) => {
  /*
  body:{
    userID:"ACasc"
    sessionID:"acasc"
  }*/

  try {
    if (!userID || !sessionID) {
      throw new Error("userID and sessionID is required");
    }
    if (!isValidObjectId(userID) || !isValidObjectId(sessionID)) {
      throw new Error("Invalid Object id");
    }
    const userExists = await User.findById(userID);
    if (!userExists) {
      throw new Error("User does not exist");
    }
    await Session.findByIdAndUpdate(sessionID, {
      $addToSet: { active_users: userID },
    });
    const session = await Session.findById(sessionID);

    return { admin: session.admin, error: null };
  } catch (error) {
    return { admin: null, error: error.message };
  }
};

// Function to update params for a session
const update_params = async (sessionID, params) => {
  /*
  body:{
    sessionID:"ACasc"
    params:{
      genre:[],
      lang:[],
      providers:[]
    }
  }*/
  try {
    if (!sessionID || !params) {
      throw new Error("sessionId and params is required");
    }
    console.log(params);
    if (!isValidObjectId(sessionID)) {
      throw new Error("Invalid Object id");
    }
    console.log(sessionID);
    await Session.findByIdAndUpdate(sessionID, {
      $set: params.time ? { time: params.time } : null,
      $addToSet: {
        "params.genre": params.genre || [],
        "params.lang": params.lang || [],
        "params.platform": params.providers || [],
      },
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// Function to get movies for a session
const getMoviesForSession = async (sessionID, currentIndex) => {
  try {
    let qty = 20;
    if (!sessionID || currentIndex === null || currentIndex === undefined) {
      throw new Error("sessionID and currentIndex are required");
    }
    // change from string to number
    currentIndex = parseInt(currentIndex, 10);

    if (!isValidObjectId(sessionID)) {
      throw new Error("Invalid Object id");
    }

    // Get the current session
    const session = await Session.findById(sessionID).select(
      "params movies_served -_id"
    );
    const { params, movies_served } = session;
    // To store the movies
    let movies = [];
    // Get the movielist length from the session
    let movie_served_len = movies_served.length;
    // if the movie list is smaller than the currentIndex and qty required amount, fetch movies from movie document
    // THIS CASE SCNEARIO:{ currentIndex: 0, qty: 20, movie_served_len: 14 }
    if (
      currentIndex + qty > movie_served_len &&
      !(currentIndex === 0 && movie_served_len !== 0)
    ) {
      movies = await getNMovies(qty, params, movies_served);
      // store the movies obtained in the sessions doc
      const _ids = movies.map((movie) => movie._id);
      await Session.findByIdAndUpdate(sessionID, {
        $push: { movies_served: { $each: _ids } },
      });
      return { movies, error: null };
    }

    const movieList = await session
      .populate({
        path: "movies_served",
        select: "title  genres poster_path",
        skip: currentIndex,
        limit: qty,
      })
      .execPopulate();

    movies = movieList.movies_served;
    // movies = movieList.movies_served.slice(currentIndex, end);
    return { movies, error: null };
  } catch (e) {
    console.log(e);
    return { movies: null, error: e.message };
  }
};

// Helper Function to get N movies from the mongoDB
const getNMovies = async (qty, params, movies_served) => {
  try {
    const query = generateQuery(
      params.genre,
      params.lang,
      params.platform,
      movies_served
    );

    const movies = await Movie.aggregate([
      { $match: query },
      { $sample: { size: qty } },
      {
        $project: {
          _id: "$_id",
          title: "$title",
          genres: "$genres",
          poster_path: "$poster_path",
        },
      },
    ]);
    return movies;
  } catch (error) {
    console.log(error);
  }
};

// Helper Function to generate query for MONGODB
const generateQuery = (genres, lang, providers, movies_served) => {
  let matchQuery = [];

  if (genres && genres.length !== 0) {
    if (typeof genres === "string") {
      genres = JSON.parse(genres);
    }
    matchQuery.push({ genres: { $in: genres } });
  }
  if (lang && lang.length !== 0) {
    if (typeof lang === "string") {
      lang = JSON.parse(lang);
    }
    matchQuery.push({ spoken_languages: { $in: lang } });
  }
  if (providers && providers.length !== 0) {
    if (typeof providers === "string") {
      providers = JSON.parse(providers);
    }
    matchQuery.push({ "providers.provider_name": { $in: providers } });
  }
  const finalQuery = {};

  if (movies_served.length > 0) {
    matchQuery.push({ _id: { $nin: movies_served } });
  }
  if (matchQuery.length === 0) {
    return finalQuery;
  } else {
    finalQuery["$and"] = matchQuery;
  }

  // if (movies_served.length > 0) {
  //   finalQuery[""] = { _id: movies_served };
  // }
  return finalQuery;
};

// Function to add to liked movies by a user
const add_to_liked_movies = async (userID, sessionID, movieID) => {
  try {
    // check for validity
    if (!userID || !sessionID || !movieID) {
      throw new Error("userID and sessionID is required");
    }
    if (
      !isValidObjectId(userID) ||
      !isValidObjectId(sessionID) ||
      !isValidObjectId(movieID)
    ) {
      throw new Error("Invalid Object id");
    }
    const { movies_liked } = await Session.findById(sessionID);
    const movieIDs = movies_liked.map((mov) => mov.movie);
    // check if the movies_liked array is empty or if the array has the new movieID
    if (movies_liked.length === 0 || !movieIDs.includes(movieID)) {
      await Session.findByIdAndUpdate(sessionID, {
        $addToSet: {
          movies_liked: { movie: movieID, liked_by: [userID], like_count: 1 },
        },
      });

      return { liked_by: 1 };
    }
    // find the index of the movieID in the  movies_liked array
    const movieIndex = movieIDs.findIndex((mov) => {
      return mov.equals(movieID);
    });

    // Get the liked_by array for that movieID
    const likedBY = movies_liked[movieIndex].liked_by;
    // Check if the user has already liked the movie
    const isPresent = likedBY.includes(userID);
    // If not run the update
    if (!isPresent) {
      await Session.updateOne(
        {
          _id: sessionID,
          "movies_liked.movie": movieID,
        },
        {
          $addToSet: { "movies_liked.$.liked_by": userID },
          "movies_liked.$.like_count": likedBY.length + 1,
        }
      );
    }
    const resp = await Session.findOne({ _id: sessionID }).select({
      movies_liked: { $elemMatch: { movie: movieID } },
    });
    return { liked_by: resp.movies_liked[0].liked_by.length };
  } catch (error) {
    console.log(error);
    return { liked_by: null };
  }
};

// Function to make swiping active in a session
const makeSwipingActive = async (sessionID) => {
  try {
    // check for validity
    if (!sessionID) {
      throw new Error(" sessionID is required");
    }
    if (!isValidObjectId(sessionID)) {
      throw new Error("Invalid sessionID");
    }
    let currTime = Date.now();
    await Session.findByIdAndUpdate(sessionID, {
      $set: { swiping_active: true, started_time: currTime },
    });
    return currTime;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

// const add_to_disliked_movies = async (sessionID, movieID, userID) => {};

// Function to remove a user from a session
const leave_session = async (sessionID, userID) => {
  try {
    // check for validity
    if (!userID || !sessionID) {
      throw new Error("userID and sessionID is required");
    }
    if (!isValidObjectId(userID) || !isValidObjectId(sessionID)) {
      throw new Error("Invalid Object id");
    }
    await Session.findByIdAndUpdate(sessionID, {
      $pull: { active_users: userID },
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// Function to end a session
const end_session = async (groupID) => {
  try {
    await Group.findByIdAndUpdate(groupID, {
      $set: { session_active: false },
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = {
  start_session,
  join_session,
  getMoviesForSession,
  update_params,
  end_session,
  leave_session,
  add_to_liked_movies,
  makeSwipingActive,
};
