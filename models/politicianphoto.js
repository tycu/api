'use strict';
module.exports = function(sequelize, DataTypes) {
  const PoliticianPhoto = sequelize.define('PoliticianPhoto', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
    },
    politicianId: {
      type: DataTypes.INTEGER
    },
    url: {
      type: DataTypes.STRING
    },
    main: {
      type: DataTypes.BOOLEAN
    },
    isDeleted: {
      type: DataTypes.BOOLEAN
    },
    deletedAt: {
      type: DataTypes.DATE
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    }

  }, {
    paranoid: true,
    classMethods: {
      associate: function(models) {
        PoliticianPhoto.belongsTo(models.Politician);
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
      }
    }
  });
  return PoliticianPhoto;
};