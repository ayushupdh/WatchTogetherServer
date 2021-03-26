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
  Params format:
    {
    "qty":Number,
    "genres":Array[]
    }
    */
  try {
    let qty = 10;

    if (req.query.qty && req.query.qty !== "") {
      qty = parseInt(req.query.qty, 10);
    }
    let matchQuery = {};

    if (req.query.genres && req.query.genres.length !== 0) {
      matchQuery.genres = { $in: JSON.parse(req.query.genres) };
    }
    console.log(matchQuery);
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
    res.sendStatus(500);
    console.log(error);
  }
};

const getMovieInfo = async (req, res) => {
  try {
    const _id = req.params.id;
    const movie = await Movies.findById(_id);

    res.status(200).send(movie);
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
};

module.exports = {
  getAllMovies,
  getNRandomMovies,
  dumpAllMovies,
  getMovieInfo,
};
