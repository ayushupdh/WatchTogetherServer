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
} = require("../controllers/groupController");

// Get all groups
router.get("/groups/getAll", auth, getAllGroups);

// Delete all groups
router.delete("/groups/dumpAll", auth, dumpAllGroups);

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

// Start a new session in group

// Add to active users
router.post("/groups/activeUsers", auth, () => {});

// Get active users
router.get("/groups/activeUsers", auth, () => {});

// !Delete group  Needs to be updated
router.delete("/groups/:id", auth, deleteGroup);

module.exports = router;
