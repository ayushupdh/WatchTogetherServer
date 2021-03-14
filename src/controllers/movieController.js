const Movies = require("../models/movies");

const getAllMovies = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.sendStatus(403);
    }
    const users = await Movies.find();

    return res.status(200).send(users);
  } catch (e) {
    console.log(e);
  }
};

const dumpAllMovies = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.sendStatus(403);
    }
    await Movies.deleteMany();
    return res.sendStatus(205);
  } catch (e) {
    console.log(e);
  }
};

const getNRandomMovies = async (req, res) => {
  /*
  Body should look like:
    {
    "qty":Number,
    "genres":Array[]
    }
    */
  try {
    const qty = parseInt(req.body.qty, 10);
    let matchQuery = {};

    if (req.body.genres && req.body.genres.length !== 0) {
      genres = req.body.genres;
      matchQuery.genres = { $in: req.body.genres };
    }

    const movies = await Movies.aggregate([
      { $match: matchQuery },
      { $sample: { size: qty } },
      {
        $project: {
          _id: "$_id",
          title: "$title",
          genres: "$genres",
          poster_path: "$poster_path",
        },
      },
    ]);

    res.status(200).send(movies);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllMovies,
  getNRandomMovies,
  dumpAllMovies,
};
