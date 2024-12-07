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
// Genre Insights - Calculates genre frequencies for a user's top tracks
// ----------
app.get('/genre', async (req, res) => {
    try {
        // Retrieving access token
        let sql = `select access_token from tokens where user_id = ?`;
        let param = [global.id];

        console.log(param);

        spotify_db.query(sql, param, async (err, row) => {
            if (err) {
                res.status(500).json({"message" : err.message, "data" : [] });
                return;
            }

            // Get the row possessing the access token
            if (row.length == 0) {
                res.status(400).json({"message" : "Access token is not available. Authorization required.", "data" : []});
                return;
            }

            let access_token = row[0].access_token;

            // Get top tracks from Spotify
            let topTracksResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=50&offset=0', {
                headers: { Authorization: `Bearer ${access_token}`}
            });

            // Parse top tracks response to begin analysis of genre frequencies
            let top_tracks = topTracksResponse.data.items;

            //
            // Analyze genre frequencies
            //
            
            // Utilizing a map to hold key-value pairs (genre to frequency)
            let genre_freq = new Map();
            
            // Loop through top tracks
            for (let track of top_tracks) {
                // Loop through artists to get genres of the tracks
                for (let artist of track.artists) {
                    const artistResponse = await axios.get(
                        `https://api.spotify.com/v1/artists/${artist.id}`,
                        {
                            headers: {
                            Authorization: `Bearer ${access_token}`,
                            },
                    });

                    // Using artist of track to get genre(s)
                    let genres = artistResponse.data.genres;
                    for (let genre of genres) {
                        if (genre_freq.has(genre)) {
                            genre_freq.set(genre, genre_freq.get(genre) + 1);
                        }
                        else {
                            genre_freq.set(genre, 1);
                        }
                    }

                }
            }

            // Frequencies obtained at this point
            console.log("Sending response");

            let genre_freq_object = Object.fromEntries(genre_freq);
            res.json({"message" : "success", "genre_frequencies" : genre_freq_object});
        });
    }

    catch(err) {
        res.status(500).send('Error in /genre: ' + err.message + ' **');
    }
});

// ----------
// Time Insights - Calculates the total time listening to Spotify for different periods of the day
// ----------
app.get('/time', (req, res) => {
    
});

// ----------
// Artist Insights - Most played artist by month
// ----------
app.get('/artist', (req, res) => {

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
        res.status(500).send('** Error in /login: ' + err.message + ' **');
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
        // 
        // Retrieving tokens (given authorization)
        //
        const tokenResponse = await axios.post(
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

        let { access_token, refresh_token, expires_in } = tokenResponse.data;

        //
        // Store tokens in AWS RDS database
        //
        let expire_time = new Date(Date.now() + expires_in * 1000);

        let insert_sql = `insert into
                            tokens(access_token, expiration)
                            values(?, ?);`;

        let insert_params = [access_token, expire_time];

        spotify_db.query(insert_sql, insert_params, (err, insert_result) => {
            if (err) {
                res.status(500).json({"message" : err.message, "data" : [] });
            }

            // User ID to retrieve token later on
            global.id = insert_result.insertId;
        });

        res.json({
            access_token,
            refresh_token,
            expires_in,
        });
    } 
    catch (err) {
        res.status(500).send('Error retrieving access token: ' + err.message);
    }
});