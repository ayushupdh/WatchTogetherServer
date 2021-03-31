const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    session_active: {
      type: Boolean,
      default: false,
    },
    sessions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Session",
      },
    ],
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
