'use strict';
module.exports = function(sequelize, DataTypes) {
  const Sequelize = require('sequelize');
  const Politician = sequelize.define('Politician',
  {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
    },
    thumbnail: {
      type: DataTypes.STRING
    },
    firstName: {
      type: DataTypes.STRING
    },
    lastName: {
      type: DataTypes.STRING
    },
    jobTitle: {
      type: DataTypes.STRING
    },
    twitterUsername: {
      type: DataTypes.STRING
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
      // associate: function(models) {

        // this is breaking SQL statement, not sure why yet

        // Politician.hasMany(models.Event);
        // Politician.hasMany(models.PoliticianPhoto);

        // belongsToMany instead?
        // Politician.hasMany(models.Contribution, {
        //   through: models.Event
        // });

      // EXAMPLE Associations
      // User.belongsToMany (User, {
      //   as: {
      //     singular: 'Follower',
      //     plural: 'Followers'
      //   },
      //   through: UserFollowers
      // })

      // }
    },
    defaultScope: {
      where: {
        deletedAt: null
      }
    },scopes: {
      deleted: {
        where: {
          deletedAt: {ne: null}
        }
      },
      red: {
        where: {
          color: "red"
        }
      },
      blue: {
        where: {
          color: "blue"
        }
      }
    }
  });
  return Politician;
};