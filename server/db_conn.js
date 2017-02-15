'use strict';

var sequelize = require('sequelize');

var env = process.env.NODE_ENV || 'development';
var config = require('./config.js')[env];

var db_conn = new sequelize(config.database.name, config.database.user, config.database.password, {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres'
});

var db = {};

// test connection
db_conn.authenticate()
    .then(function(err) {
        console.log('DB connection succesfull.');
    })
    .catch(function(err) {
        console.log('No db connection', err);
    });

db.sequelize = sequelize;
db.db_conn = db_conn;

module.exports = db;