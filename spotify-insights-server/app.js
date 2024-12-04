//
// app.js
// 
// Express.js and Node.js web service for Spotify Insights.
//
// Author: David Park
//

const express = require('express');
const app = express();

// Making HTTP requests to Spotify Web API
const axios = require('axios'); 

// Working with query strings
const querystring = require('querystring');

// For secure credential management
const dotenv = require('dotenv');
dotenv.config();

const config = require('./config.js');
const spotify_db = require('./spotify_db.js');

// 
// Spotify app credentials 
//
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

console.log(CLIENT_ID);

// -----------
// Main
// -----------
app.listen(config.service_port, () => {
    console.log('SERVER: web service is running, listening on port', config.service_port);

    process.env.AWS_SHARED_CREDENTIALS_FILE = config.spotify_insights_server_config;
});

// ----------
// Login
// ----------
app.get('/login', (req, res) => {
    let scope = 'user-top-read playlist-modify-public';
    
    res.redirect('https://accounts.spotify.com/authorize?' + 
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI
        }));
});

// ----------
// Callback
// ----------


// ----------
// Refresh
// ----------