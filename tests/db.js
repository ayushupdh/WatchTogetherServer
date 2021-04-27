const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../src/models/user");

// Instantiate two users for testing
const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "Dumbledore",
  email: "dumbledore@hogwarts.com",
  username: "dumbledore",
  password: "Acidpopsand7horcruxes",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};
const userTwoId = new mongoose.Types.ObjectId();

const userTwo = {
  _id: userTwoId,
  name: "Potter",
  email: "potatoter@hogwarts.com",
  username: "potatoter",
  password: "ohno901!",
  friends: [userOneId],
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
    },
  ],
};

// Instantiate two users for testing
const setupDatabase = async () => {
  await User.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
};

module.exports = {
  setupDatabase,
  userOne,
  userOneId,
  userTwo,
  userTwoId,
};
