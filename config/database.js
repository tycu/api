'use strict';

const debug = require('debug')('controllers:datbase.js:' + process.pid);


var envParam = process.argv[2];

console.log('process.argv', process.argv);

const createDB = function() { // NOTE could have (callback)
  const pg     = require('pg'),
        db     = new pg.Client(),
        path   = require("path"),
        env    = process.env.NODE_ENV || envParam,
        config = require(path.join(__dirname, '.', 'database.json'))[env],
        dbName = config.database;

      // Sequelize = require('sequelize'),

  db.connect(function () { // NOTE could have arg (err)
    debug('using database: %s', dbName);
    db.query('CREATE DATABASE ' + dbName, function() { // NOTE could have arg (err)
      // var sequelize = new Sequelize(dbName, config.username, config.password, config);
      // callback(sequelize);


      db.end(); // NOTE close the connection
    });
  });
};
createDB();
