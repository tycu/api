'use strict';
module.exports = function(sequelize, DataTypes) {
  var PacEvent = sequelize.define('PacEvent', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id'
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
      type: Sequelize.DATE
      field: 'created_at'
    },
    updatedAt: {
      type: Sequelize.DATE
      field: 'updated_at'
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return PacEvent;
};