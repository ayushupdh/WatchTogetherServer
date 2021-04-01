const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sessionSchema = new Schema(
  {
    groupID: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    active_users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    movies_served: [
      {
        type: Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],
    movies_liked: [
      {
        movie: {
          type: Schema.Types.ObjectId,
          ref: "Movie",
        },
        liked_by: [
          {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: [],
          },
        ],
        like_count: {
          type: Number,
          default: 0,
        },
      },
    ],
    params: {
      genre: [
        {
          type: String,
        },
      ],
      platform: [
        {
          type: String,
        },
      ],
      lang: [
        {
          type: String,
        },
      ],
    },
    current_session_time: {
      type: Number,
      required: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    toJson: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
    timestamps: true,
  }
);

sessionSchema.set("toObject", { virtuals: true });
sessionSchema.set("toJSON", { virtuals: true });
const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
