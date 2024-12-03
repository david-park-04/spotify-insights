//
// Express.js and Node.js web service for Spotify Insights.
//
// Author: David Park
//

const express = require('express');
const app = express();

// main()
app.listen(8080, () => {
    console.log('SERVER: web service is running, listening on port 8080');
});

//
// web service functions (API)
// 
let login = require('./api_login.js');

app.get('/login', login.get_login);