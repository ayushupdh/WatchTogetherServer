const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const auth = require("../middleware/auth");
const {
  getAllUsers,
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
} = require("../controllers/userControllers.js");

// TO do
// Find out a way to remove pre hooks from user

// Get all users
router.get("/users/getAll", getAllUsers);

// Dump all users
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

// Get user's friends
router.get("/users/me/friend", auth, getUsersFriends);

// Search user's friends
router.get("/users/me/searchFriend", auth, searchUsersFriend);

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

// Get user liked movies
router.get("/users/me/likedMovies", auth, getLikedMovies);

// Add to  user liked movies
router.post("/users/me/likedMovies", auth, addtoLikedMovies);

// Add to  user disliked movies
router.post("/users/me/dislikedMovies", auth, addtoDislikedMovies);

// --------------------------User Movie routes end--------------------------------

// const checkforUniqueEmailorUsername=async(email,username)=>{
//     const emailUser = await User.findOne({email})

//     if(emailUser){
//         return {error: "Email already exists"}
//     }
//     const usernameUser = await User.findOne({username})
//     if(usernameUser){
//         return {error: "Username already exists"}
//     }
// }

module.exports = router;
