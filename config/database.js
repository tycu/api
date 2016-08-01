'use strict'

var fs = require("fs");

var createDB = function(callback) {
  var Sequelize = require('sequelize');
  var pg        = require('pg');
  var client    = new pg.Client();
  var path      = require("path");
  var env       = process.env.NODE_ENV || "development";
  var config    = require(path.join(__dirname, '.', 'database.json'))[env];
  var dbName = config.database;
  // var host = config.host;

  client.connect(function (err) {
    console.log('using database:', dbName);
    client.query('CREATE DATABASE ' + dbName, function(err) {
      // var sequelize = new Sequelize(dbName, config.username, config.password, config);
      // callback(sequelize);


      // NOTE for clearing DB
      // client.query('SET FOREIGN_KEY_CHECKS = 0')
      // .then(function(){
      //     return client.sync({ force: true });
      // })
      // .then(function(){
      //     return client.query('SET FOREIGN_KEY_CHECKS = 1')
      // })
      // .then(function(){
      //     console.log('Database synchronised.');
      // }, function(err){
      //     console.log(err);
      // });


      client.end(); // close the connection
    });
  });
};
createDB();

var unsetDB = function(callback) {
  db.query('SET FOREIGN_KEY_CHECKS = 0')
  .then(function(){
      return db.sync({ force: true });
  })
  .then(function(){
      return db.query('SET FOREIGN_KEY_CHECKS = 1')
  })
  .then(function(){
      console.log('Database synchronised.');
  }, function(err){
      console.log(err);
  });
};

// unsetDB();
