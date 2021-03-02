const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const moviesSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  poster_image: {
    type: String,
  },
  genres: [
    {
      type: String,
    },
  ],
  language: [
    {
      type: String,
    },
  ],
  description: {
    type: String,
  },
  directors: [
    {
      type: String,
    },
  ],
  producers: [
    {
      type: String,
    },
  ],
  release_date: {
    type: String,
  },
  Revenue: {
    type: String,
  },
  trailer_video_link: {
    type: String,
  },
  runtime: {
    type: String,
  },
  ratings: {
    type: String,
  },
  cast: [
    {
      type: String,
    },
  ],
});

const Movie = mongoose.model("Movie", moviesSchema);

module.exports = Movie;
