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
      type: Sequelize.BOOLEAN
    },
    deletedAt: {
      type: Sequelize.DATE
    },
    createdAt: {
      type: Sequelize.DATE
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