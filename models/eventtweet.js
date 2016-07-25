'use strict';
module.exports = function(sequelize, DataTypes) {
  var Sequelize = require('sequelize');
  var EventTweet = sequelize.define('EventTweet', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
    },
    eventId: {
      type: DataTypes.INTEGER,
      field: 'event_id'
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id'
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
        EventTweet.belongsTo(models.Event)
      }
    }
  });
  return EventTweet;
};