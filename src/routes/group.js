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
} = require("../controllers/groupController");

// Get all groups
router.get("/groups/getAll", auth, getAllGroups);

// Delete all groups
router.delete("/groups/dumpAll", auth, dumpAllGroups);

// Create a group
router.post("/groups/create", auth, createGroup);

// Get group users
router.get("/groups/users", auth, getGroupUsers);

// Add users to group
router.post("/groups/addUser", auth, addUsertogroup);

// Start a new session in group

// Add to active users
router.post("/groups/activeUsers", auth, () => {});

// Get active users
router.get("/groups/activeUsers", auth, () => {});

// Get groups info
router.get("/groups/:id", auth, getGroupInfo);

module.exports = router;
