'use strict';
module.exports = function(sequelize, DataTypes) {
  var Pac = sequelize.define('Pac', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id'
    },
    name: {
      type: DataTypes.STRING,
      field: 'name'
    },
    description: {
      type: DataTypes.STRING,
      field: 'description'
    },
    color: {
      type: DataTypes.STRING,
      field: 'color'
    },
    twitterUsername: {
      type: DataTypes.STRING,
      field: 'twitter_username'
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
  return Pac;
};