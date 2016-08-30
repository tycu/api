'use strict';
module.exports = function(sequelize, DataTypes) {
  const Sequelize = require('sequelize');
  const Contribution = sequelize.define('Contribution', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
    },
    amount: {
      type: DataTypes.STRING
    },
    chargeUuid: {
      type: DataTypes.INTEGER
    },
    support: {
      type: DataTypes.BOOLEAN
    },
    userId: {
      type: DataTypes.INTEGER
    },
    eventId: {
      type: DataTypes.INTEGER
    },
    pacId: {
      type: DataTypes.INTEGER
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
        Contribution.belongsTo(models.User);
        Contribution.belongsTo(models.Event);
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
  return Contribution;
};
