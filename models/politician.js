'use strict';
module.exports = function(sequelize, DataTypes) {
  var Politician = sequelize.define('Politician', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id'
    },
    thumbnail: {
      type: DataTypes.STRING,
      field: 'thumbnail'
    },
    firstName: {
      type: DataTypes.STRING,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING,
      field: 'last_name'
    },
    jobTitle: {
      type: DataTypes.STRING,
      field: 'job_title'
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
  return Politician;
};