const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const auth = require("../middleware/auth");
// const multer = require("multer");
const {
  getAllUsers,
  getOtherUserInfo,
  changeUserInfo,
  deleteAllUsers,
  signupUser,
  loginUser,
  logoutUser,
  logoutUserEveryWhere,
  deleteUsersAccount,
  getUsersAccount,
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
  changeAvatar,
  getMoviesforUser,
} = require("../controllers/userControllers.js");
// const { upload } = require("../middleware/multerUpload");

// TO do
// Find out a way to remove pre hooks from user

// Get all users --only for dev
router.get("/users/getAll", getAllUsers);

// Dump all users --only for dev
router.delete("/users/dumpAll", deleteAllUsers);

// Search Users
router.get("/users/search", auth, searchUser);

// --------------------------Auth Routes--------------------------------
// Signup user
router.post("/users/signup", signupUser);

// Login user
router.post("/users/login", loginUser);

// Logout User
router.patch("/users/logout", auth, logoutUser);

// Logout User from everywhere
router.patch("/users/logoutAll", auth, logoutUserEveryWhere);
// --------------------------Auth Routes ends--------------------------------

// --------------------------User Account Routes--------------------------------

// Gets user account
router.get("/users/me", auth, getUsersAccount);

// Deletes user account
router.delete("/users/me", auth, deleteUsersAccount);

// Change user info
router.patch("/users/me/", auth, changeUserInfo);

// Change user avatar
router.patch("/users/me/avatar", auth, changeAvatar);

// Get user's friends
router.get("/users/me/friend", auth, getUsersFriends);

// Search user's friends
router.get("/users/me/searchFriend", auth, searchUsersFriend);

// Search user's friends
router.get("/users/me/otherUserInfo", auth, getOtherUserInfo);

// Add a friend to user account
router.patch("/users/me/friend", auth, addUsersFriends);

// Remove a friend from user account
router.delete("/users/me/friend", auth, removeUsersFriends);

// Change user status
router.patch("/users/me/status", auth, changeUsersStatus);

// Get user groups
router.get("/users/me/groups", auth, getUsersGroup);

// --------------------------User Account Ends--------------------------------

// --------------------------User Movie routes--------------------------------

// Get N random movies for user
router.get("/users/me/movies", auth, getMoviesforUser);

// Get user liked movies
router.get("/users/me/likedMovies", auth, getLikedMovies);

// Add to  user liked movies
router.post("/users/me/likedMovies", auth, addtoLikedMovies);

// Add to  user disliked movies
router.post("/users/me/dislikedMovies", auth, addtoDislikedMovies);

// --------------------------User Movie routes end--------------------------------

module.exports = router;
