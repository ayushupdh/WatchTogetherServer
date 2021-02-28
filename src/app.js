const express = require('express')
require('./db/mongoose')
const cors = require('cors')
const User = require('./models/user')
const userRouter = require('./routes/user')
const app =express()
app.use(cors())

app.use(express.json())
app.use(userRouter)

module.exports= app
