const User = require("../models/user");
const Movie = require("../models/movies");
const upload = require("../services/multerUpload");
const deleteFileFromS3 = require("../services/deleteFile");
const singleUpload = upload.single("avatar");
const { runBG_RemoveOldDislikedMovies } = require("../services/background");
// TODO Add user avatar on add friends
const getAllUsers = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.sendStatus(403);
    }
    const users = await User.find();
    res.status(200).send(users);
  } catch (e) {
    console.log(e);
    res.status(400);
  }
};
const deleteAllUsers = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.sendStatus(403);
    }
    await User.deleteMany();
    res.status(205).send({ message: "Users Deleted" });
  } catch (e) {
    console.log({ errors: e });
  }
};

const searchUser = async (req, res) => {
  try {
    const searchQuery = req.query.username;
    let users = undefined;
    users = await User.find(
      {
        $or: [
          {
            username: searchQuery,
            _id: { $ne: req.user._id },
          },
          { email: searchQuery, _id: { $ne: req.user._id } },
        ],
      },
      "username name avatar"
    ).sort("name");
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};

const getOtherUserInfo = async (req, res) => {
  // {
  //   "id":"6061542ca6b5721fa152fdf1"
  // }
  try {
    const userID = req.query.id;
    if (!userID) {
      return res.sendStatus(403);
    }
    let user = {};
    const isUserFriend = req.user.friends.includes(userID);
    if (isUserFriend) {
      user = await User.findById(userID)
        .populate({
          path: "groups",
          select: "_id -users",
        })
        .select("name username avatar liked_movies groups");
      user = user.toJSON();
      user.isFriend = true;
      user.groups = user.groups.length;
      user.liked_movies = user.liked_movies.length;
    } else {
      user = await User.findById(userID).select("name username avatar");
      user = user.toJSON();

      user.isFriend = false;
    }
    return res.send(user);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

const searchUsersFriend = async (req, res) => {
  try {
    const searchQuery = req.query.username;
    let users = await User.find({ _id: req.user._id }).populate({
      path: "friends",
      match: {
        $or: [
          { username: new RegExp(searchQuery, "i") },
          { email: new RegExp(searchQuery, "i") },
        ],
      },
      select: "name avatar",
    });
    if (users && users.length === 1) {
      return res.status(200).send(users[0].friends);
    } else {
      return res.sendStatus(404);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
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
  req.body.avatar = "";
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
        return res.status(400).send({ error: error.username.message });
      }
      if (error.email) {
        return res.status(400).send({ error: error.email.message });
      }
    }
    return res.status(400).send({ error: "Error signing up" });
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
    res.status(400).send({ error: error });
  }
};

const logoutUser = async (req, res) => {
  try {
    // req.user.tokens = req.user.tokens.filter((token) => {
    //   return token.token !== req.token;
    // });
    // await req.user.save();
    await User.updateOne(
      { _id: req.user._id },
      { tokens: req.user.tokens.filter((token) => token.token !== req.token) }
    );
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(404);
  }
};

const logoutUserEveryWhere = async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { tokens: [] });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
};
const getUsersAccount = async (req, res) => {
  try {
    const userObj = req.user.toObject();
    delete userObj.tokens;
    delete userObj.password;
    delete userObj.disliked_movies;
    delete userObj.liked_movies;
    delete userObj.friends;
    delete userObj.__v;
    res.status(200).send(userObj);
    runBG_RemoveOldDislikedMovies(req.user);
  } catch (e) {
    console.log(e);
  }
};

const changeUserInfo = async (req, res) => {
  try {
    const user = req.user;
    const validChanges = ["username", "name", "email"];
    const keyReceived = Object.keys(req.body);
    let valid = true;
    keyReceived.forEach((key) => {
      if (!validChanges.includes(key)) {
        valid = false;
      }
    });
    if (!valid) {
      return res.sendStatus(403);
    }
    await User.findByIdAndUpdate(user._id, req.body);

    res.status(200).send("OK");
  } catch (e) {
    if (e.keyValue && e.keyValue.username) {
      return res
        .status(403)
        .send({ usernameError: "Username is already taken." });
    }
    if (e.keyValue && e.keyValue.email) {
      return res
        .status(403)
        .send({ emailError: "Account already exist with that email." });
    }
    return res.sendStatus(404);
  }
};

const changeAvatar = async (req, res) => {
  try {
    singleUpload(req, res, async function (err) {
      if (err) {
        if (err.message && err.message === "File too large") {
          err.message = "File size cannot be larger than 2 MB";
        }
        return res.status(403).send({
          errors: {
            type: "Image Upload Error",
            message: err.message,
          },
        });
      }
      if (req.file) {
        let update = { avatar: req.file.location };
        let prevAvatar = req.user.avatar;

        await User.findByIdAndUpdate(req.user._id, update);
        res.sendStatus(200);
        if (prevAvatar && prevAvatar !== "") {
          deleteFileFromS3(prevAvatar);
        }
      } else {
        return res.sendStatus(404);
      }
    });
  } catch (error) {
    console.log(e);
    res.sendStatus(500);
  }
};

const deleteUsersAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(404);
  }
};

const getUsersFriends = async (req, res) => {
  try {
    // Populate friends feild
    // !Add user avatar too later
    await req.user.populate("friends", "name username avatar").execPopulate();

    return res.status(200).send({ friends: req.user.friends });
  } catch (e) {
    console.log(e);
  }
};
// !Might need to change later
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
    // check if the friend is oneself
    if (
      req.body.friend === req.user.username ||
      req.body.friend === req.user.email
    ) {
      throw new Error("Cannot be friends with themselves");
    }

    let friend = await User.findOne({ username: req.body.friend });

    // check if the friend user exists
    if (!friend) {
      friend = await User.findOne({ email: req.body.friend });
      if (!friend) {
        throw Error("No user with that username or email");
      }
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
    await User.updateOne(
      { _id: friend._id },
      { $addToSet: { friends: req.user._id } }
    );

    return res.sendStatus(200);
  } catch (e) {
    res.status(404).send({ error: e.message });
  }
};
const removeUsersFriends = async (req, res) => {
  try {
    let friendID = req.query.id;
    // check if friend is already in the friends list
    let exist = req.user.friends.find((friendId) => friendId.equals(friendID));

    // !Not tested
    if (!exist) {
      throw new Error("No such friend present.");
    }

    await User.updateOne(
      { _id: req.user._id },
      { $pull: { friends: friendID } }
    );
    await User.updateOne(
      { _id: friendID },
      { $pull: { friends: req.user._id } }
    );

    return res.sendStatus(200);
  } catch (e) {
    res.status(404).send({ error: e.message });
  }
};
const changeUsersStatus = async (req, res) => {
  /*  body should look like:
        {  status: boolean  }
   */
  try {
    if (!req.body.status || typeof req.body.status !== "boolean") {
      return res.status(403).send({ error: "Invalid type" });
    }

    await User.updateOne(
      { _id: req.user._id },
      { user_status: req.body.status }
    );

    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(404);
  }
};

// !Not tested ---GROUP
const getUsersGroup = async (req, res) => {
  try {
    await req.user
      .populate({
        path: "groups",
        options: {
          select: "name session_active _id -users",
          sort: { createdAt: -1 },
        },
      })
      .execPopulate();
    return res.status(200).send({ groups: req.user.groups });
  } catch (error) {
    console.log(error);
    res.status(404).send(error.message);
  }
};
// TODO: Paginate movies you send
const getLikedMovies = async (req, res) => {
  try {
    // req.user.populate("liked_movies").execPopulate();
    // !Change here to get backdrop path maybe
    await req.user
      .populate("liked_movies", "title poster_path overview genres")
      .execPopulate();
    res.status(200).send(req.user.liked_movies);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};

const addtoLikedMovies = async (req, res) => {
  try {
    const userID = req.user._id;
    const movieID = req.body.movieId;

    await User.findByIdAndUpdate(userID, {
      $addToSet: { liked_movies: movieID },
    });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
};

const addtoDislikedMovies = async (req, res) => {
  try {
    const userID = req.user._id;
    const movieID = req.body.movieId;

    await User.findByIdAndUpdate(userID, {
      $addToSet: { disliked_movies: movieID },
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};
const getMoviesforUser = async (req, res) => {
  try {
    const params = req.query;
    const movies_present = [
      ...req.user.liked_movies,
      ...req.user.disliked_movies,
    ];
    // console.log(movies);
    const query = generateQuery(
      params.genre,
      params.lang,
      params.platform,
      movies_present
    );
    const movies = await getNMovies(10, query);

    res.send(movies);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const getNMovies = async (qty, query) => {
  try {
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

const generateQuery = (genres, lang, providers, movies_present) => {
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

  if (movies_present.length > 0) {
    matchQuery.push({ _id: { $ne: movies_present } });
  }
  if (matchQuery.length === 0) {
    return finalQuery;
  } else {
    finalQuery["$or"] = matchQuery;
  }

  // if (movies_served.length > 0) {
  //   finalQuery[""] = { _id: movies_served };
  // }
  return finalQuery;
};

module.exports = {
  getAllUsers,
  getOtherUserInfo,
  changeAvatar,
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
  getUsersGroup,
  getLikedMovies,
  addtoLikedMovies,
  addtoDislikedMovies,
  searchUser,
  searchUsersFriend,
  changeUserInfo,
  getMoviesforUser,
};
