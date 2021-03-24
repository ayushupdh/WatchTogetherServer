const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const moviesSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    adult: {
      type: Boolean,
      required: true,
    },
    poster_path: {
      type: String,
      required: true,
    },
    genres: [
      {
        type: String,
      },
    ],
    spoken_languages: [
      {
        type: String,
      },
    ],
    overview: {
      type: String,
    },
    production_companies: [
      {
        type: String,
      },
    ],
    release_date: {
      type: String,
    },
    budget: {
      type: Number,
      required: true,
    },
    revenue: {
      type: Number,
      required: true,
    },
    trailer: {
      site: {
        type: String,
      },
      key: {
        type: String,
      },
      size: {
        type: Number,
      },
    },
    runtime: {
      type: Number,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
    imdb_id: {
      type: String,
    },
    providers: [
      {
        display_priority: {
          type: Number,
        },
        logo_path: {
          type: String,
        },
        provider_id: {
          type: Number,
        },
        provider_name: {
          type: String,
        },
      },
    ],
  },
  { toJson: { virtuals: true }, toObject: { virtuals: true }, id: false }
);

moviesSchema.set("toObject", { virtuals: true });
moviesSchema.set("toJSON", { virtuals: true });
const Movie = mongoose.model("Movie", moviesSchema);

module.exports = Movie;
