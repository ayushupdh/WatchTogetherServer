const User = require("../models/user");
const Group = require("../models/group");

const getAllUsers = async (req, res) => {
  try {
    if (req.body.key !== process.env.key) {
      return res.sendStatus(403);
    }
    const users = await User.find();
    res.status(201).send(users);
  } catch (e) {
    console.log(e);
    res.status(400);
  }
};
const deleteAllUsers = async (req, res) => {
  try {
    if (req.body.key !== process.env.key) {
      return res.sendStatus(404);
    }
    await User.deleteMany();
    res.status(201).send({ message: "Users Deleted" });
  } catch (e) {
    console.log({ errors: e });
  }
};

const signupUser = async (req, res) => {
  /*body should look like
   {
       "name":"Name",
       "username":"username",
       "email":"username@example.com",
       "password":"password123"
   } 
   */
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateToken();
    res.status(201).send({ user, token });
  } catch (e) {
    // Catch what kind of error thrown
    if (e.errors) {
      let error = e.errors;

      // Send error if duplicate username or email
      if (error.username) {
        res.status(400).send(error.username.message);
      }
      if (error.email) {
        res.status(400).send(error.email.message);
      }
    }
    res.status(400).send(e);
  }
};

const loginUser = async (req, res) => {
  /*body should look like
{
    "username":"username",
    "password":"password123"
}
or
    {
    "username":"email@example.com",
    "password":"password123"
}
*/
  try {
    const user = await User.findByCredentials(
      req.body.username,
      req.body.password
    );

    const token = await user.generateToken();

    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
};

const logoutUser = async (req, res) => {
  try {
    // req.user.tokens = req.user.tokens.filter((token) => {
    //   return token.token !== req.token;
    // });
    // await req.user.save();
    await User.updateOne(
      { email: req.user.email },
      { tokens: req.user.tokens.filter((token) => token.token !== req.token) }
    );
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
};

const logoutUserEveryWhere = async (req, res) => {
  try {
    // req.user.tokens =[]
    // await req.user.save();
    await User.updateOne({ email: req.user.email }, { tokens: [] });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
};
const getUsersAccount = async (req, res) => {
  try {
    res.send(req.user);
  } catch (e) {
    res.sendStatus(404);
    console.log(e);
  }
};
const deleteUsersAccount = async (req, res) => {
  try {
    await User.findOneAndDelete({ email: req.user.email });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(404);
  }
};
const getUsersFriends = async (req, res) => {
  try {
    // Populate friends feild
    await req.user.populate("friends", "name username").execPopulate();

    return res.status(200).send({ friends: req.user.friends });
  } catch (e) {
    console.log(e);
    res.status(404).send({ error: e.message });
  }
};
const addUsersFriends = async (req, res) => {
  /*  body should look like:
        {
            friend: email@example.com
        }
        or
         {
            friend: username
        }

   */
  try {
    let friend = await User.findOne({ username: req.body.friend });

    // check if the friend user exists
    if (!friend) {
      friend = await User.findOne({ email: req.friend });
      if (!friend) {
        throw Error("No user with that username or email");
      }
    }
    // check if the friend is oneself
    if (friend._id.equals(req.user._id)) {
      throw new Error("Cannot be friends with themselves");
    }
    // check if friend is already in the friends list
    let exist = req.user.friends.find((friendId) =>
      friendId.equals(friend._id)
    );
    if (exist) {
      throw new Error("Already friends with this user.");
    }

    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { friends: friend._id } }
    );

    return res.sendStatus(200);
  } catch (e) {
    res.status(404).send({ error: e.message });
  }
};
const removeUsersFriends = async (req, res) => {
  /*  body should look like:
        {
            friend: email@example.com
        }
        or
         {
            friend: username
        }

   */
  try {
    let friend = await User.findOne({ username: req.body.friend });

    // check if the friend user exists
    if (!friend) {
      friend = await User.findOne({ email: req.friend });
      if (!friend) {
        throw Error("No user with that username or email");
      }
    }
    // check if the friend is oneself
    if (friend._id.equals(req.user._id)) {
      throw new Error("Cannot be the users own id");
    }
    // check if friend is already in the friends list
    let exist = req.user.friends.find((friendId) =>
      friendId.equals(friend._id)
    );
    if (!exist) {
      throw new Error("No such friend present.");
    }

    await User.updateOne(
      { _id: req.user._id },
      { $pull: { friends: friend._id } }
    );

    return res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(404).send({ error: e.message });
  }
};

const changeUsersStatus = async (req, res) => {
  /*  body should look like:
        {  status: boolean  }
   */
  try {
    await User.updateOne(
      { _id: req.user._id },
      { user_status: req.body.status }
    );
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
};

const joinAGroup = async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { groups: [req.group_id] });
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(404).send(error.message);
  }
};
module.exports = {
  getAllUsers,
  deleteAllUsers,
  signupUser,
  loginUser,
  logoutUser,
  logoutUserEveryWhere,
  getUsersAccount,
  deleteUsersAccount,
  getUsersFriends,
  addUsersFriends,
  removeUsersFriends,
  changeUsersStatus,
};
