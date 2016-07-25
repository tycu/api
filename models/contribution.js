'use strict';
module.exports = function(sequelize, DataTypes) {
  var Sequelize = require('sequelize');
  var Contribution = sequelize.define('Contribution', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
    },
    amount: {
      type: DataTypes.STRING,
      field: 'amount'
    },
    chargeUuid: {
      type: DataTypes.INTEGER,
      field: 'charge_uuid'
    },
    support: {
      type: DataTypes.BOOLEAN,
      field: 'support'
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id'
    },
    eventId: {
      type: DataTypes.INTEGER,
      field: 'event_id'
    },
    pacId: {
      type: DataTypes.INTEGER,
      field: 'pac_id'
    },
    createdAt: {
      type: Sequelize.DATE,
      field: 'created_at'
    },
    updatedAt: {
      type: Sequelize.DATE,
      field: 'updated_at'
    }
  }, {
    underscored: true,
    paranoid: true,
    classMethods: {
      associate: function(models) {
        Contribution.belongsTo(models.User);
        Contribution.belongsTo(models.Event);
      }
    }
  });
  return Contribution;
};
