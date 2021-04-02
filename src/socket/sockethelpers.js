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
    const session = new Session({
      groupID,
      admin: userID,
      active_users: [userID],
      current_session_time: current_session_time,
      params: { genre: genres, platform: providers, lang },
    });
    await session.save();

    await Group.findByIdAndUpdate(groupID, {
      session_active: true,
      $addToSet: { sessions: session._id },
    });

    return { session: session._id, error };
  } catch (e) {
    return { session, error: e.message };
  }
};

const join_session = async () => {};

module.exports = { start_session, join_session };
