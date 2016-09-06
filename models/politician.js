'use strict';
module.exports = function(sequelize, DataTypes) {
  const Sequelize = require('sequelize');
  const Politician = sequelize.define('Politician', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
    },
    thumbnail: {
      type: DataTypes.STRING
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: false
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
        Politician.hasMany(models.PoliticianPhoto, { foreignKey: 'politicianId' });
        Politician.hasMany(models.Event, { foreignKey: 'politicianId' });

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
  return Politician;
};