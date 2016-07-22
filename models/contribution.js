'use strict';
var Contribution = sequelize.define('Contribution', {
  id: {
    type: DataTypes.INTEGER,
    field: 'id'
  },
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id'
  },
  chargeId: {
    type: DataTypes.INTEGER,
    field: 'charge_id'
  },
  amount: {
    type: DataTypes.STRING,
    field: 'amount'
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
}, {
  freezeTableName: true
});



module.exports = function(sequelize, DataTypes) {
  var Contribution = sequelize.define('Contribution', {

  }, {

  });
  return Contribution;
};