const app = require('./app')
const https = require('https');

const port = process.env.PORT || 4000

app.listen(port, () => {
    console.log("server starting on port : " + port)
  });