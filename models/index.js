'use strict';

const fs        = require('fs'),
      path      = require('path'),
      Sequelize = require('sequelize'),
      cancan = require('cancan'),
      can = cancan.can;

var basename  = path.basename(module.filename),
    env       = process.env.NODE_ENV || 'development',
    config    = require('../config/database.json')[env],
    db        = {},
    sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(function(file) {
    if (file.slice(-3) !== '.js') return;
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }

  if (modelName === 'User') {
    console.log("adding cancan permissions to User");

    cancan.configure(db[modelName], function (user) {
      // ALL actions: view, add, edit, destroy
      // this.can('view', Event);

      if (user.role === 'user') {

        this.can('view', User, function(user) {
          return this.id === user.id
        });

        // update own users info
        // add/view own contribution info contribution
      }


      if (user.role === 'admin') {
        // whitelist all: 'manage'
        this.can('manage', Event);
        this.can('manage', Politician);
        this.can('view', EventTweet);
        this.can('view', User);
        this.can('manage', Pac);
        this.can('manage', PacEvent);
        this.can('manage', Politician);
        this.can('destroy', Event);
      }
    });
  }

});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
