'use strict';
module.exports = function(sequelize, DataTypes) {
  var Sequelize = require('sequelize');
  var Event = sequelize.define('Event', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
    },
    isPinned: {
      type: DataTypes.BOOLEAN
    },
    imageUrl: {
      type: DataTypes.STRING
    },
    imageAttribution: {
      type: DataTypes.STRING
    },
    politicianId: {
      type: DataTypes.INTEGER
    },
    headline: {
      type: DataTypes.STRING
    },
    summary: {
      type: DataTypes.TEXT
    },
    isDeleted: {
      type: Sequelize.BOOLEAN
    },
    deletedAt: {
      type: Sequelize.DATE
    },
    createdAt: {
      type: Sequelize.DATE
    },
    updatedAt: {
      type: Sequelize.DATE
    }
  }, {
    paranoid: true,
    classMethods: {
      associate: function(models) {

        // TODO set up proper association to pull contributions with fetch
        // Event.hasMany(models.Contribution);



        // this is breaking SQL statement, not sure why yet
        // Event.belongsTo(models.Politician);
        // Event.hasMany(models.EventTweet);
      }
    },
    defaultScope: {
      where: {
        isDeleted: false
      }
    },
    scopes: {
      deleted: {
        where: {
          isDeleted: true
        }
      },
      pinned: {
        where: {
          isPinned: true
        }
      }
  }
  });
  return Event;
};