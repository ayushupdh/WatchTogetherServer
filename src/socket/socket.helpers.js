const { isValidObjectId } = require("mongoose");
const Group = require("../models/group");
const User = require("../models/user");

const Session = require("../models/session");

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
    return { session, error: e.message };
  }
};

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
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
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
    if (!isValidObjectId(sessionID)) {
      throw new Error("Invalid Object id");
    }
    console.log(sessionID);
    await Session.findByIdAndUpdate(sessionID, {
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

const add_to_liked_movies = async (sessionID, movieID, userID) => {};
const add_to_disliked_movies = async (sessionID, movieID, userID) => {};
const leave_session = async (sessionID, userID) => {};
const end_session = async (sessionID, userID) => {};

module.exports = { start_session, join_session, update_params, end_session };
