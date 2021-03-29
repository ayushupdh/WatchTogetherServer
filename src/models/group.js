const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    active_users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // liked_movies: [Movies],
    // disliked_movies: [Movies],
    sessions: [
      {
        type: Date,
        default: Date.now(),
      },
    ],
    current_session_time: {
      type: Number,
      required: true,
    },
    created_by: {
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

groupSchema.set("toObject", { virtuals: true });
groupSchema.set("toJSON", { virtuals: true });
const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
