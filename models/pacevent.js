'use strict';
module.exports = function(sequelize, DataTypes) {
  var Sequelize = require('sequelize');
  var PacEvent = sequelize.define('PacEvent', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
    },
    eventId: {
      type: DataTypes.INTEGER,
      field: 'event_id'
    },
    pacId: {
      type: DataTypes.INTEGER,
      field: 'pac_id'
    },
    support: {
      type: DataTypes.BOOLEAN,
      field: 'support'
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
        PacEvent.belongsTo(models.Pac);
        PacEvent.belongsTo(models.Event);
      }
    }
  });
  return PacEvent;
};