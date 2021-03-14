const express = require("express");
const router = new express.Router();

// Get all groups
router.get("/movies/getAll", getAllGroups);

// Delete all groups
router.delete("/movies/dumpAll", dumpAllGroups);
