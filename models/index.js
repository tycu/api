'use strict';

var fs        = require('fs'),
    path      = require('path'),
    Acl       = require('acl'),
    Sequelize = require('sequelize'),
    basename  = path.basename(module.filename),
    env       = process.env.NODE_ENV || 'development',
    config    = require('../config/database.json')[env],
    db        = {},
    AclSeq    = require('acl-sequelize'),
    sequelize,
    acl;


if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable]);
  acl = new Acl(new AclSeq(sequelize, { prefix: 'acl_' }));
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
   acl = new Acl(new AclSeq(sequelize, { prefix: 'acl_' }));
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
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
