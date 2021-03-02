const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const {
  getAllGroups,
  createGroup,
  dumpAllGroups,
  getGroupInfo,
} = require("../controllers/groupController");

// TO DO:
// Fix groups populating when user is populated issue.

// Get all groups
router.get("/groups/getAll", auth, getAllGroups);

// Delete all groups
router.delete("/groups/dumpAll", auth, dumpAllGroups);

// Get group users

// Create a group
router.post("/groups/create", auth, createGroup);

// Get groups info
router.get("/groups/:id", auth, getGroupInfo);

// Add users to group

// Start a new session in group

module.exports = router;
