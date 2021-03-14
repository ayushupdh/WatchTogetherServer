const express = require("express");
const router = new express.Router();
const {
  getAllMovies,
  getNRandomMovies,
  dumpAllMovies,
} = require("../controllers/movieController");

// Get all groups
router.get("/movies/getAll", getAllMovies);

// Delete all groups
router.delete("/movies/dumpAll", dumpAllMovies);

// Get n random movies with specified genres
router.get("/movies/getNRandom", getNRandomMovies);

module.exports = router;
