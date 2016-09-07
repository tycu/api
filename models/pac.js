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
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['blue', 'red']]
      }
    },
    pacType: {
      type: DataTypes.INTEGER,
      // allowNull: false
    },
    twitterUsername: {
      type: DataTypes.STRING
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
        Pac.hasMany(models.PacEvent);
        Pac.hasMany(models.EventTweet);
      }
    },
    defaultScope: {
      where: {
        deletedAt: null
      }
    },scopes: {
      deleted: {
        where: {
          deletedAt: {ne: null}
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