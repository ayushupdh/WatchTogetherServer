const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const moviesSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    poster_path: {
      type: String,
      required: true,
    },
    backdrop_path: {
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
    release_date: {
      type: String,
    },
    status: {
      type: String,
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
    cast: [
      {
        name: {
          type: String,
        },
        profile_path: {
          type: String,
        },
        character: {
          type: String,
        },
        order: {
          type: Number,
        },
      },
    ],
    crew: [
      {
        name: {
          type: String,
        },
        job: {
          type: String,
        },
      },
      {
        name: {
          type: String,
        },
        job: {
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
