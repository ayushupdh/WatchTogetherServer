const Group = require("../models/group");
const User = require("../models/user");

const getAllGroups = async (req, res) => {
  try {
    if (req.body.key !== process.env.key) {
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
    console.log(groups);
    res.status(200).send(groups);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

const dumpAllGroups = async (req, res) => {
  try {
    if (req.body.key !== process.env.key) {
      return res.sendStatus(404);
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
    const newGroup = new Group(req.body);
    await newGroup.save();

    await User.updateOne({ _id: req.user._id }, { groups: [newGroup._id] });

    return res.sendStatus(200);
  } catch (e) {
    console.log(e);
    return res.send(403);
  }
};

const addUserToGroup = "";

module.exports = { getAllGroups, createGroup, dumpAllGroups, getGroupInfo };
