const express = require("express");
require("./db/mongoose");
const cors = require("cors");
const User = require("./models/user");
const userRouter = require("./routes/user");
const groupRouter = require("./routes/group");

const app = express();
app.use(cors());

app.use(express.json());
app.use(userRouter);
app.use(groupRouter);

module.exports = app;
