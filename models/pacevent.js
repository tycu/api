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
      type: DataTypes.INTEGER,
      validate: {
        isInt: true
      }
    },
    pacId: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: true
      }
    },
    support: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      validate: {
        isIn: [[true, false]]
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