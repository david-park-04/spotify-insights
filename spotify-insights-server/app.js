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
const { encode } = require('punycode');
const { access } = require('fs');

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
            let topTracksResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50&offset=0', {
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
            console.log(genre_freq);
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
// Favorite Artist
// ----------
app.get('/favorite_artist', (req, res) => {
    try {
        let sql = `select access_token from tokens where user_id = ?`;
        let param = [global.id];

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
            let topTracksResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50&offset=0', {
                headers: { Authorization: `Bearer ${access_token}`}
            });

            //
            // Analyze favorite artist based on top tracks
            //
            let top_tracks = topTracksResponse.data.items;

            // Utilizing a map to hold key-value pairs (artist to frequency)
            let artist_freq = new Map();

            // Loop through top tracks
            for (let track of top_tracks) {
                // Loop through artists
                for (let artist of track.artists) {
                    if (artist_freq.has(artist.name)) {
                        artist_freq.set(artist.name, artist_freq.get(artist.name) + 1);
                    }
                    else {
                        artist_freq.set(artist.name, 1);
                    }
                }
            }

            console.log(artist_freq);

            // Finding top artist
            let top_artist = '';
            let top_frequency = 0;
            for (let [artist, frequency] of artist_freq) {
                if (frequency > top_frequency) {
                    top_frequency = frequency;
                    top_artist = artist;
                }
            }

            console.log('Sending response');
            res.json({"message" : "success", "data" : [top_artist, top_frequency]});
        });
    }

    catch(err) {
        res.status(500).send('Error in /favorite_artist: ' + err.message + ' **');
    }
});

// ----------
// Create Artist Playlist
// ----------
app.get('/artist_playlist', (req, res) => {
    let sql = `select access_token from tokens where user_id = ?`;
    let param = [global.id];

    spotify_db.query(sql, param, async (err, res) => {
        try {
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
            let topTracksResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50&offset=0', {
                headers: { Authorization: `Bearer ${access_token}`}
            });

            let top_tracks = topTracksResponse.data.items;

            // Utilizing a map to hold key-value pairs (artist to frequency)
            let artist_freq = new Map();

            // Loop through top tracks
            for (let track of top_tracks) {
                // Loop through artists
                for (let artist of track.artists) {
                    if (artist_freq.has(artist.name)) {
                        artist_freq.set(artist.name, artist_freq.get(artist.name) + 1);
                    }
                    else {
                        artist_freq.set(artist.name, 1);
                    }
                }
            }

            // Find minimum occurring artist
            let new_artist = '';
            let top_frequency = 1000;
            for (let [artist, frequency] of artist_freq) {
                if (frequency < top_frequency) {
                    new_artist = artist;
                    top_frequency = frequency;
                }
            }

            //
            // Create a playlist filled with songs of the artist you may like
            //

            // Get the user's Spotify ID
            let spotifyIDResponse = await axios.get('https://api.spotify.com/v1/me', {
                headers : { Authorization: `Bearer ${access_token}`}
            });

            let spotify_id = spotifyIDResponse.data.id;

            // Create playlist
            let describe = {
                name: `This is ${new_artist}`,
                description: 'Playlist created by Spotify Insights.',
                public: true
            }
            let playlist_url = `https://api.spotify.com/v1/users/${spotify_id}/playlists`;

            let artistPlaylistResponse = await axios.post(playlist_url, describe, {
                headers: {Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json'}
            });

            let playlist_id = artistPlaylistResponse.data.id;

            // Retrieve Spotify ID of artist
            let encoded_artist = encodeURIComponent(new_artist);

            let search_url = `https://api.spotify.com/v1/search?q=${encoded_artist}&type=artist&limit=1`;

            let artistIDResponse = await axios.get(search_url, {
                headers : { Authorization : `Bearer ${access_token}`}
            });
            
            let artist_id = artistIDResponse.data.items[0].id;

            // Retrieve top tracks of artist
            let top_songs_artist_url = `https://api.spotify.com/v1/artists/${artist_id}/top-tracks`;

            let topSongsResponse = await axios.get(top_songs_artist_url, {
                header : { Authorization : `Bearer ${access_token}`}
            });

            let top_artist_songs_uris = topSongsResponse.data.tracks.map(track => track.uri);

            // Add songs to created playlist
            let add_url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;

            let addSongsResponse = await axios.post(add_url, {
                uris : top_artist_songs_uris
            }, {
                headers: {Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json'}
            });
            
        }
        
        catch(err) {
            res.status(500).send('Error in /artist_playlist: ' + err.message + ' **');
        }


    });
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