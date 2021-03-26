const fs = require("fs");
const Movie = require("./movies");
require("../db/mongoose");

let moviesjson = fs.readFileSync("data.json", "utf-8");
let movies = JSON.parse(moviesjson);

const writeTODB = async () => {
  try {
    // Drop All
    await Movie.deleteMany();
    for (let i = 0; i < movies.length; i++) {
      console.log(movies[i].title);
      const movie = new Movie(movies[i]);
      await movie.save();
    }
    console.log("Done");
  } catch (e) {
    console.log(e);
  }
};

writeTODB();
