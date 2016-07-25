'use strict';
module.exports = function(sequelize, DataTypes) {
  var Sequelize = require('sequelize');
  var Politician = sequelize.define('Politician',
  {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
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
      Politician.hasMany(models.Event);


      // EXAMPLE Associations
      // User.belongsToMany (User, {
      //   as: {
      //     singular: 'Follower',
      //     plural: 'Followers'
      //   },
      //   through: UserFollowers
      // })

      // Politician.hasMany(models.Contribution, {through: models.Event})
      }
    }
  });
  return Politician;
};