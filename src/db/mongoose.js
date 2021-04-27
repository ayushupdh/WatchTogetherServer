const mongoose = require("mongoose");

// Start mongodb
mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
module.exports = db;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', ()=> {
//     console.log('Connected to DB');
//   });
