'use strict';
module.exports = function(sequelize, DataTypes) {
  var Sequelize = require('sequelize');
  var Pac = sequelize.define('Pac', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      field: 'name'
    },
    description: {
      type: DataTypes.STRING,
      field: 'description'
    },
    color: {
      type: DataTypes.STRING,
      field: 'color'
    },
    twitterUsername: {
      type: DataTypes.STRING,
      field: 'twitter_username'
    },
    createdAt: {
      type: Sequelize.DATE,
      field: 'created_at'
    },
    updatedAt: {
      type: Sequelize.DATE,
      field: 'updated_at'
    }
}, {
    underscored: true,
    paranoid: true,
    classMethods: {
      associate: function(models) {
        Pac.hasMany(models.PacEvent)
      }
    }
  });
  return Pac;
};