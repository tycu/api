'use strict';
module.exports = function(sequelize, DataTypes) {
  const Sequelize = require('sequelize');
  const PoliticianPhoto = sequelize.define('PoliticianPhoto', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
    },
    politicianId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    main: {
      type: Sequelize.BOOLEAN,
      allowNull: false
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
        PoliticianPhoto.belongsTo(models.Politician, { foreignKey: 'politicianId' });

        PoliticianPhoto.belongsToMany(models.Event, {
          as:'event_pol_photos',
          through: 'Politicians',
          foreignKey: 'politicianId'
        } );

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
  return PoliticianPhoto;
};