'use strict';
module.exports = function(sequelize, DataTypes) {
  var EventTweet = sequelize.define('EventTweet', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id'
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
      type: Sequelize.DATE
      field: 'created_at'
    },
    updatedAt: {
      type: Sequelize.DATE
      field: 'updated_at'
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return EventTweet;
};