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
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        // what additional validation do we want here?
      }
    },
    chargeUuid: { // NOTE format: ch_17x5NXF3SBSFqhmCMPSeo1Jr
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        len: [20, 50]
      }
    },
    support: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      validate: {
        isIn: [[true, false]]
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pacId: {
      type: DataTypes.INTEGER,
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
