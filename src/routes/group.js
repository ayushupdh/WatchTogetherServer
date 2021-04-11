const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const {
  getAllGroups,
  createGroup,
  dumpAllGroups,
  getGroupInfo,
  addUsertogroup,
  getGroupUsers,
  deleteGroup,
  removeUserFromGroup,
  createSession,
  getActiveUsers,
  addUserToSession,
  removeUserFromSession,
  getMoviesForSession,
  addToMoviesLiked,
  getSessionInfo,
  endSession,
  resetSession,
  getResultsforSession,
} = require("../controllers/groupController");

// Get all groups
router.get("/groups/getAll", auth, getAllGroups);

// Delete all groups
router.delete("/groups/dumpAll", auth, dumpAllGroups);

// ----------------------------Session Routes---------------------------------------------

// Create a new Session
router.post("/groups/session", auth, createSession);

// End a  new Session
router.post("/groups/session/end", auth, endSession);

// Get session info
router.get("/groups/session", auth, getSessionInfo);

// Get Active users
router.get("/groups/session/users", auth, getActiveUsers);

// Add to active users
router.post("/groups/session/addusers", auth, addUserToSession);

//Remove from active users
router.post("/groups/session/removeusers", auth, removeUserFromSession);

//Get movies for this session
router.get("/groups/session/movies", auth, getMoviesForSession);

//Get results for this session
router.get("/groups/session/results", auth, getResultsforSession);

// Add to liked movies
router.post("/groups/session/moviesliked", auth, addToMoviesLiked);

// Reset session

router.post("/groups/reset-session", auth, resetSession);

// ----------------------------Session Routes Ends---------------------------------------------

// Create a group
router.post("/groups/create", auth, createGroup);

// Get groups info
router.get("/groups/:id", auth, getGroupInfo);

// Get group users
router.get("/groups/:id/users", auth, getGroupUsers);

// Add users to group
router.post("/groups/:id/users", auth, addUsertogroup);

// Remove users from group
router.delete("/groups/:groupId/users/:userId", auth, removeUserFromGroup);

// !Delete group  Needs to be updated
router.delete("/groups/:id", auth, deleteGroup);

module.exports = router;
