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
    await groups.populate("users", "name username").execPopulate();
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
            created_by: User._id
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
            groupID: Schema.Types.ObjectId
          }
  }*/

  // check if the user is part of that group
  try {
    const { users } = await Group.findById(req.body.groupId, "users -_id");

    if (users.includes(req.user._id)) {
      await Group.findByIdAndUpdate(req.body.groupId, {
        users: users.concat(req.body.userId),
      });

      return res.sendStatus(200);
    }
    return res.status(401);
  } catch (error) {
    console.log(error);
    return res.status(404).send({ error: "The group does not exists" });
  }
  // add the user to a group
};

const getGroupUsers = async (req, res) => {
  /*    body:{
            groupID: Schema.Types.ObjectId
          }
  }*/

  // check if the user is part of that group
  try {
    const { users } = await (
      await Group.findById(req.body.groupId, "users -_id").populate(
        "users",
        "name _id username email"
      )
    ).execPopulate();

    return res.status(200).send({ users });
  } catch (error) {
    console.log(error);
    return res.status(404).send({ error: "The group does not exists" });
  }
  // add the user to a group
};
module.exports = {
  getAllGroups,
  createGroup,
  dumpAllGroups,
  getGroupInfo,
  addUsertogroup,
  getGroupUsers,
};
