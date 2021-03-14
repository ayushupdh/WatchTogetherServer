const express = require("express");
require("./db/mongoose");
const cors = require("cors");
const userRouter = require("./routes/user");
const groupRouter = require("./routes/group");
const moviesRouter = require("./routes/movie");

const app = express();
app.use(cors());

app.use(express.json());
app.use(userRouter);
app.use(groupRouter);
app.use(moviesRouter);

module.exports = app;
