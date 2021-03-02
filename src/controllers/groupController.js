const Group = require("../models/group");

const getAllGroups = async (req, res) => {
  try {
    if (req.body.key !== process.env.key) {
      return res.sendStatus(403);
    }
    const groups = await Group.find();
    res.status(201).send(groups);
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = { getAllGroups };
