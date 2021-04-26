const fs = require("fs");
const Movie = require("../models/movies");
const db = require("../db/mongoose");

let moviesjson = fs.readFileSync(__dirname + "/data.json", "utf-8");
let movies = JSON.parse(moviesjson);

const writeTODB = async () => {
  try {
    // Drop All
    // await Movie.deleteMany();
    console.log("Total movies to upload: " + movies.length);
    for (let i = 0; i < movies.length; i++) {
      console.log(movies[i].title);
      const movie = new Movie(movies[i]);
      await movie.save();
    }
    console.log("----------Done--------------");
  } catch (e) {
    console.log(e);
  }
};
console.log("\nUploading Movies...\n");
writeTODB().then(() => {
  db.close();
});
