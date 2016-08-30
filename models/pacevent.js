'use strict';
module.exports = function(sequelize, DataTypes) {
  const Sequelize = require('sequelize');
  const PacEvent = sequelize.define('PacEvent', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
    },
    eventId: {
      type: DataTypes.INTEGER
    },
    pacId: {
      type: DataTypes.INTEGER
    },
    support: {
      type: DataTypes.BOOLEAN
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
        PacEvent.belongsTo(models.Pac);
        PacEvent.belongsTo(models.Event);
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
      },
      support: {
        where: {
          support: true
        }
      },
      oppose: {
        where: {
          support: false
        }
      }
    }
  });
  return PacEvent;
};