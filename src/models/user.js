const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      validate(value) {
        if (value.includes("password")) {
          throw new Error("Cant use password as password");
        }
      },
    },
    user_status: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    liked_movies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],
    disliked_movies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    toJson: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
    timestamps: true,
  }
);

// To use virtual fields(GROUPS)
userSchema.virtual("groups", {
  ref: "Group",
  //   Field on this document
  localField: "_id",
  //   Field on the other document
  foreignField: "users",
});

//check for password update before save
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Check for unique email
userSchema.path("email").validate(async (email) => {
  const emailCount = await User.countDocuments({ email });
  return !emailCount;
}, "Email already exists");

// Check for unique username
userSchema.path("username").validate(async (username) => {
  const usernameCount = await User.countDocuments({ username });
  return !usernameCount;
}, "Username already exists");

//This is for objects. Objects use this method
userSchema.methods.generateToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  // user.tokens = user.tokens.concat({token})
  // await user.save()

  // Update token
  await User.updateOne(
    { email: user.email },
    { tokens: user.tokens.concat({ token }) }
  );
  return token;
};

// When returning the schema as json
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.tokens;
  delete userObject.password;
  return userObject;
};

//not object dependent. Use on the class
// Search for user using username/email and password
userSchema.statics.findByCredentials = async (usernameOrEmail, password) => {
  let user = await User.findOne(
    { email: usernameOrEmail },
    "-liked_movies -disliked_movies -friends "
  );
  if (!user) {
    user = await User.findOne(
      { username: usernameOrEmail },
      "-liked_movies -disliked_movies -friends "
    );

    if (!user) {
      throw new Error("User not found");
    }
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Password does not match");
  }
  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
