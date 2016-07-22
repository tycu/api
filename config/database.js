'use strict'
var fs = require("fs");

module.exports.init = function(callback) {
  var Sequelize = require('sequelize');
  var pg = require('pg');
  var client = new pg.Client();
  var path      = require("path");
  var env       = process.env.NODE_ENV || "development";
  var config    = require(path.join(__dirname, '.', 'config.json'))[env];

  var dbName = config.database;
  // var host = config.host;

  client.connect(function (err) {
    console.log('using database:', dbName);
    client.query('CREATE DATABASE ' + dbName, function(err) {
      var sequelize = new Sequelize(dbName, config.username, config.password, config);
      callback(sequelize);
      // client.end(); // close the connection
    });
  });

};
