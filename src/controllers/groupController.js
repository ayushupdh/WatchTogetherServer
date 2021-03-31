const Group = require("../models/group");

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
    const groups = await Group.findOne({ _id: req.params.id });
    await groups
      .populate("users created_by", "name username created_by avatar")
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
        current_session_time: Number,
  }
  */
  try {
    req.body.sessions = [Date.now()];
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

module.exports = {
  getAllGroups,
  createGroup,
  dumpAllGroups,
  getGroupInfo,
  addUsertogroup,
  getGroupUsers,
  deleteGroup,
  removeUserFromGroup,
};
