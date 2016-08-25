'use strict';

const debug = require('debug')('controllers:datbase.js:' + process.pid);

const createDB = function() { // NOTE could have (callback)
  const pg     = require('pg'),
        db     = new pg.Client(),
        path   = require("path"),
        env    = process.env.NODE_ENV || "development",
        config = require(path.join(__dirname, '.', 'database.json'))[env],
        dbName = config.database;

      // Sequelize = require('sequelize'),

  db.connect(function () { // NOTE could have arg (err)
    debug('using database: %s', dbName);
    db.query('CREATE DATABASE ' + dbName, function() { // NOTE could have arg (err)
      // var sequelize = new Sequelize(dbName, config.username, config.password, config);
      // callback(sequelize);


      // NOTE for clearing DB
      // db.query('SET FOREIGN_KEY_CHECKS = 0')
      // .then(function(){
      //     return db.sync({ force: true });
      // })
      // .then(function(){
      //     return db.query('SET FOREIGN_KEY_CHECKS = 1')
      // })
      // .then(function(){
      //     console.log('Database synchronised.');
      // }, function(err){
      //     console.log(err);
      // });


      db.end(); // NOTE close the connection
    });
  });
};
createDB();

const unsetDB = function() {
  const pg = require('pg'),
        db = new pg.Client();

  db.query('SET FOREIGN_KEY_CHECKS = 0')
  .then(function(){
    return db.sync({ force: true });
  })
  .then(function(){
    return db.query('SET FOREIGN_KEY_CHECKS = 1');
  })
  .then(function(){
    debug('Database synchronised.');
  }, function(err){
    debug(err);
  });
};

// unsetDB();
