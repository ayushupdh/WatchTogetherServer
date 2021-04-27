const express = require("express");
const router = new express.Router();
const {
  getAllMovies,
  getNRandomMovies,
  dumpAllMovies,
  getMovieInfo,
} = require("../controllers/movieController");

// Get all groups --only for dev
router.get("/movies/getAll", getAllMovies);

// Delete all groups
router.delete("/movies/dumpAll", dumpAllMovies);

// Get n random movies with specified genres
router.get("/movies/getNRandom", getNRandomMovies);

// Get a movie info
router.get("/movies/:id", getMovieInfo);

module.exports = router;
