'use strict';
module.exports = function(sequelize, DataTypes) {
  const Sequelize = require('sequelize');
  const EventTweet = sequelize.define('EventTweet', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
    },
    pacId: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: true
      }
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: true
      }
    },
    deletedAt: {
      type: Sequelize.DATE
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false
    }
  }, {
    paranoid: true,
    classMethods: {
      associate: function(models) {
        EventTweet.belongsTo(models.Pac, {foreignKey: 'pacId'});
        EventTweet.belongsTo(models.Event, {foreignKey: 'eventId'});
        EventTweet.belongsTo(models.User, {foreignKey: 'userId'});
      }
    },
    defaultScope: {
      where: {
        deletedAt: null
      }
    },
    scopes: {
      deleted: {
        where: {
          deletedAt: {ne: null}
        }
      }
    }
  });
  return EventTweet;
};