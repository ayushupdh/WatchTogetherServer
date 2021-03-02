const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const { getAllGroups } = require("../controllers/groupController");

// Get all groups
router.get("/groups/getAll", auth, getAllGroups);

// Get groups info

// Get group users

// Create a group

// Add users to group

// Start a new session in group

module.exports = router;
