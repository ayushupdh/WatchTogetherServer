const mongoose = require("mongoose");

mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', ()=> {
//     console.log('Connected to DB');
//   });
