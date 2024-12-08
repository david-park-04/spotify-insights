//
// spotify_db.js 
//
// spotify_db: connection objection to MySQL database in AWS RDS
// 

const mysql = require('mysql');
const fs = require('fs');
const ini = require('ini');

const config = require('./config.js');

const spotify_insights_server_config = ini.parse(fs.readFileSync(config.spotify_insights_server_config, 'utf-8'));
const endpoint = spotify_insights_server_config.rds.endpoint;
const port_number = spotify_insights_server_config.rds.port_number;
const user_name = spotify_insights_server_config.rds.user_name;
const user_pwd = spotify_insights_server_config.rds.user_pwd;
const db_name = spotify_insights_server_config.rds.db_name;

//
// creates connection object, but doesn't open connnection:
//
let spotify_db = mysql.createConnection(
  {
    host: endpoint,
    port: port_number,
    user: user_name,
    password: user_pwd,
    database: db_name,
    multipleStatements: true  // allow multiple queries in one call
  }
);

module.exports = spotify_db;