const express = require("express");
require("./db/mongoose");
const cors = require("cors");
const userRouter = require("./routes/user");
const groupRouter = require("./routes/group");
const moviesRouter = require("./routes/movie");

const app = express();
// use cors to handle cors errors
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form data

// Express use custom routes
app.use(userRouter);
app.use(groupRouter);
app.use(moviesRouter);

module.exports = app;
