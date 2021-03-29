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
    "lang":Array[]
    "providers":Array[]
    }
    */
  try {
    let { qty, genres, lang, providers } = req.query;

    if (qty && qty !== "") {
      qty = parseInt(qty, 10);
    } else {
      qty = 10;
    }
    let matchQuery = generateQuery(genres, lang, providers);

    const movies = await Movies.aggregate([
      { $match: matchQuery },
      { $sample: { size: qty } },
      {
        $project: {
          _id: "$_id",
          title: "$title",
          genres: "$genres",
          poster_path: "$poster_path",
          // spoken_languages: "$spoken_languages",
          // provs: "$providers.provider_name",
        },
      },
    ]);

    res.status(200).send(movies);
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
};

const generateQuery = (genres, lang, providers) => {
  let matchQuery = [];

  if (genres && genres.length !== 0) {
    if (typeof genres === "string") {
      genres = JSON.parse(genres);
    }
    matchQuery.push({ genres: { $in: genres } });
  }
  if (lang && lang.length !== 0) {
    if (typeof lang === "string") {
      lang = JSON.parse(lang);
    }
    matchQuery.push({ spoken_languages: { $in: lang } });
  }
  if (providers && providers.length !== 0) {
    if (typeof providers === "string") {
      providers = JSON.parse(providers);
    }
    matchQuery.push({ "providers.provider_name": { $in: providers } });
  }

  if (matchQuery.length === 0) {
    return {};
  }

  return { $and: matchQuery };
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
