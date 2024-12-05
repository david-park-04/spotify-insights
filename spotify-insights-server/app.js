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

// For express session
const session = require('express-session');

app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
    })
);

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
    try {
        let scope = 'user-top-read playlist-modify-public';
    
        res.redirect('https://accounts.spotify.com/authorize?' + 
            querystring.stringify({
                response_type: 'code',
                client_id: CLIENT_ID,
                scope: scope,
                redirect_uri: REDIRECT_URI
            }));
    }
    catch(err) {
        res.status(500).send('** Error in /login:' + err.message + ' **');
    }
});

// ----------
// Callback
// ----------
app.get('/callback', async (req, res) => {
    let code = req.query.code || null;

    if (!code) {
        return res.status(400).send('Authorization code not found.');
    }

    try {
        let tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                code: code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization:
                        'Basic ' +
                        Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
                },
            }
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        req.session.tokens = {
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresIn: expires_in,
            acquiredAt: Date.now(),
          };

        res.json({
            access_token,
            refresh_token,
            expires_in,
        });
    } 
    catch (error) {
        res.status(500).send('Error retrieving access token: ' + error.message);
    }
});

// ----------
// Refresh token
// ----------
app.get('/refresh_token', async (req, res) => {
    let refreshToken = req.query.refresh_token;

    if (!refreshToken) {
        return res.status(400).send('Refresh token is missing.');
    }

    try {
        const refreshResponse = await axios.post(
            "https://accounts.spotify.com/api/token",
            querystring.stringify({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization:
                        'Basic ' +
                        Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
                },
            }
        );

        const { access_token, expires_in } = refreshResponse.data;

        res.json({
            access_token,
            expires_in,
        });
    } catch (error) {
        res.status(500).send('Error refreshing token: ' + error.message);
    }
});
  