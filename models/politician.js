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
    isDeleted: {
      type: Sequelize.BOOLEAN
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
        Politician.hasMany(models.Event);
        Politician.hasMany(models.PoliticianPhoto);

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

      }
    },
    defaultScope: {
      where: {
        isDeleted: false
      }
    },scopes: {
      deleted: {
        where: {
          isDeleted: true
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