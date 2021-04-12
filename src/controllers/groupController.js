const { isValidObjectId } = require("mongoose");
const Group = require("../models/group");
const Session = require("../models/session");
const User = require("../models/user");
const Movie = require("../models/movies");

const createMovieObject = (id) => {
  return { movie: "605da28ddc4fc974181cd682", liked_by: [], like_count: 0 };
};
// !Turn Session active false at some point
const getAllGroups = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.sendStatus(403);
    }

    const groups = await Group.find();
    res.status(201).send(groups);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

const getGroupInfo = async (req, res) => {
  try {
    const groups = await Group.findOne({ _id: req.params.id }).select(
      "-sessions"
    );
    await groups
      .populate("users created_by ", "name  created_by avatar")
      .execPopulate();

    res.status(200).send(groups);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

const dumpAllGroups = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.sendStatus(403);
    }
    await Group.deleteMany();
    res.status(200).send({ message: "Groups Deleted" });
  } catch (e) {
    res.status(400).send(e);
  }
};

const createGroup = async (req, res) => {
  /*
  body: {
        name: String,
  }
  */
  try {
    req.body.created_by = req.user._id;
    req.body.users = [req.user._id];
    const newGroup = new Group(req.body);
    newGroup.save();

    return res.status(200).send(newGroup);
  } catch (e) {
    return res.send(403);
  }
};

const addUsertogroup = async (req, res) => {
  /*    body:{
            userId: Schema.Types.ObjectId,
          }
  }*/

  // check if the user is part of that group
  try {
    const groupID = req.params.id;
    const { users } = await Group.findById(groupID, "users -_id");

    if (users.includes(req.user._id)) {
      await Group.findByIdAndUpdate(groupID, {
        $addToSet: { users: req.body.userId },
      });
      return res.sendStatus(200);
    }
    return res.status(403);
  } catch (error) {
    console.log(error);
    return res.status(404).send({ error: "The group does not exists" });
  }
  // add the user to a group
};

const removeUserFromGroup = async (req, res) => {
  try {
    const groupID = req.params.groupId;
    const userID = req.params.userId;
    // check if the user is part of that group
    const { users } = await Group.findById(groupID, "users -_id");
    if (!users.includes(req.user._id)) {
      removeGroupHelper(groupID);
      return res.sendStatus(403);
    }
    await Group.findByIdAndUpdate(groupID, {
      $pull: { users: userID },
    });
    res.sendStatus(200);
    // Background job to remove the group if there is no more member left
    removeGroupHelper(groupID);
  } catch (error) {
    console.log(error);
    return res.status(404).send({ error: "The group does not exists" });
  }
  // add the user to a group
};

const getGroupUsers = async (req, res) => {
  /*    query:{
            groupID: Schema.Types.ObjectId
          }
  }*/

  // check if the user is part of that group
  try {
    const { users } = await (
      await Group.findById(req.params.id, "users -_id").populate(
        "users",
        "name avatar _id"
      )
    ).execPopulate();

    return res.status(200).send({ users });
  } catch (error) {
    console.log(error);
    return res.status(404).send({ error: "The group does not exists" });
  }
  // add the user to a group
};

const deleteGroup = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.sendStatus(403);
    }
    const groupId = req.params.id;

    await Group.findByIdAndRemove(groupId);

    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(400);
  }
};

const removeGroupHelper = async (groupID) => {
  const groups = await Group.findById(groupID, "users -_id");

  if (groups.users && groups.users.length === 0) {
    await Group.deleteOne({ _id: groupID });
  }
};
const getSessionInfo = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.sendStatus(403);
    }
    const { sessionID } = req.query;
    const sessions = await Session.findById(sessionID);
    res.status(200).send(sessions);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

// ----------------------------Session Controllers---------------------------------------------
const getGroupsSession = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error("GroupID is required");
    }
    if (!isValidObjectId(id)) {
      throw new Error("Invalid Object id");
    }

    const ss = await Group.findById(id).select(" sessions -_id");
    const { sessions } = await ss
      .populate({
        path: "sessions",
        options: {
          select: "createdAt",
          sort: { createdAt: -1 },
        },
      })
      .execPopulate();

    return res.send(sessions);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};
const createSession = async (req, res) => {
  /*
  body:{
    groupID:"acascasc",
    userID:""
    current_session_time:10,
    genres:[],
    lang:[],
    platform:[]

  }
  */
  try {
    const {
      groupID,
      userID,
      genres,
      lang,
      platform,
      currentSessionTime,
    } = req.body;

    if (!groupID || !userID || !currentSessionTime) {
      return res.sendStatus(403);
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

    const session = new Session({
      groupID,
      admin: userID,
      active_users: [userID],
      current_session_time: currentSessionTime,
      params: { genre: genres, platform, lang },
    });
    session.save();
    console.log(session);
    await Group.findByIdAndUpdate(groupID, {
      session_active: true,
      $addToSet: { sessions: session._id },
    });
    return;
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};
const getActiveUsers = async (req, res) => {
  try {
    const { sessionID } = req.query;
    if (!sessionID) {
      throw new Error("sessionID is required");
    }
    if (!isValidObjectId(sessionID)) {
      throw new Error("Invalid Object id");
    }

    const users = await Session.findById(sessionID).select("active_users -_id");

    return res.send({ users: users.active_users });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

const addUserToSession = async (req, res) => {
  /*
  body:{
    userID:"ACasc"
    sessionID:"acasc"
  }*/
  try {
    const { userID, sessionID } = req.body;
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
    console.log(session.admin);
    return res.send(session.admin);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};
const removeUserFromSession = async (req, res) => {
  /*
  body:{
    userID:"ACasc"
    sessionID:"acasc"
  }*/
  try {
    const { userID, sessionID } = req.body;
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
      $pull: { active_users: userID },
    });
    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

const getResultsforSession = async (req, res) => {
  /*
  params:{
    sessionID:"acasc"
  }*/
  try {
    const { sessionID } = req.query;
    if (!sessionID) {
      throw new Error(" sessionID is required");
    }
    if (!isValidObjectId(sessionID)) {
      throw new Error("Invalid sessionID");
    }

    let results = await Session.findById(sessionID)
      .select("movies_liked active_users -_id")
      .populate({
        path: "active_users movies_liked.liked_by movies_liked.movie",
        select: "name avatar overview title poster_path",
      });
    results = results.toObject();
    if (results && results.movies_liked && results.movies_liked.length > 1) {
      results.movies_liked.sort((firstMovie, secondMovie) => {
        return secondMovie.like_count - firstMovie.like_count;
      });
      if (results.movies_liked.length > 5) {
        results.movies_liked = results.movies_liked.slice(0, 5);
      }
    }
    return res.send(results);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

const getMoviesForSession = async (req, res) => {
  try {
    // Validate params and if session exists
    let { sessionID, currentIndex, qty } = req.query;
    if (!sessionID || !currentIndex || !qty) {
      throw new Error("sessionID, currentIndex and qty are required");
    }
    // change from string to number
    currentIndex = parseInt(currentIndex, 10);
    qty = parseInt(qty, 10);

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
    if (currentIndex + qty > movie_served_len) {
      movies = await getNMovies(qty, params, movies_served);
      // store the movies obtained in the sessions doc
      const _ids = movies.map((movie) => movie._id);
      await Session.findByIdAndUpdate(sessionID, {
        $push: { movies_served: { $each: _ids } },
      });
      return res.send(movies);
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
    return res.send(movies);
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: error.mesage });
  }
};

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
    matchQuery.push({ _id: { $ne: movies_served } });
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

const addToMoviesLiked = async (req, res) => {
  /*
  body:{
    userID:"ACasc"
    sessionID:"acasc"
    movieId:"asacssc"
  }*/
  try {
    const { userID, sessionID, movieID } = req.body;
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

      return res.send({ like_count: 1 });
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
    // const resu = await Session.aggregate([
    //   { $match: { _id: sessionID } },
    //   { $filter: { "movies_liked.movie": { $eq: movieID } } },
    // ]);
    const resp = await Session.findOne({ _id: sessionID }).select({
      movies_liked: { $elemMatch: { movie: movieID } },
    });

    return res.send({ like_count: resp.movies_liked[0].liked_by.length });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: error.message });
  }
};

const resetSession = async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.sendStatus(403);
  }
  /*
  body:{
    groupID:"acasc"
  }*/
  try {
    const { groupID } = req.body;

    await Group.findByIdAndUpdate(groupID, {
      $set: { session_active: false, sessions: [] },
    });
    const group = await Group.findById(groupID);

    return res.send(group);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

const endSession = async (req, res) => {
  /*
  body:{
    groupID:"acasc"
  }*/
  try {
    const { groupID } = req.body;

    await Group.findByIdAndUpdate(groupID, {
      session_active: false,
    });

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

const renameGroup = async (req, res) => {
  /*
  body:{
    groupID:"acasc",
    name:"newName"
  }*/
  try {
    const { groupID, name } = req.body;

    await Group.findByIdAndUpdate(groupID, {
      $set: { name: name },
    });

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
// ----------------------------Session Controllers end---------------------------------------------

module.exports = {
  getAllGroups,
  createGroup,
  dumpAllGroups,
  getGroupInfo,
  addUsertogroup,
  getGroupUsers,
  deleteGroup,
  removeUserFromGroup,
  createSession,
  getActiveUsers,
  addUserToSession,
  removeUserFromSession,
  getMoviesForSession,
  addToMoviesLiked,
  getSessionInfo,
  endSession,
  resetSession,
  getResultsforSession,
  getGroupsSession,
  renameGroup,
};
