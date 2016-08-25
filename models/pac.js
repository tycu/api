'use strict';
module.exports = function(sequelize, DataTypes) {
  const Sequelize = require('sequelize');
  const Pac = sequelize.define('Pac', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    color: {
      type: DataTypes.STRING
    },
    twitterUsername: {
      type: DataTypes.STRING
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
        Pac.hasMany(models.PacEvent);
        Pac.hasMany(models.EventTweet);
      }
    },
    defaultScope: {
      where: {
        isDeleted: false
      }
    },scopes: {
      deleted: {
        where: {
          isDeleted: true
        }
      },
      red: {
        where: {
          color: "red"
        }
      },
      blue: {
        where: {
          color: "blue"
        }
      }
    }
  });
  return Pac;
};