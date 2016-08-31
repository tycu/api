'use strict';
module.exports = function(sequelize, DataTypes) {
  const Sequelize = require('sequelize');
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      validate: {
        isIn: [[true, false]]
      }
    },
    isBreaking: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      validate: {
        isIn: [[true, false]]
      }
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      validate: {
        isIn: [[true, false]]
      }
    },
    imageUrl: {
      type: DataTypes.STRING
    },
    imageAttribution: {
      type: DataTypes.STRING
    },
    politicianId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    headline: {
      type: DataTypes.STRING,
      allowNull: false
    },
    summary: {
      type: DataTypes.TEXT
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
      // associate: function(models) {

        // TODO set up proper association to pull contributions with fetch
        // Event.hasMany(models.Contribution);



        // this is breaking SQL statement, not sure why yet
        // Event.belongsTo(models.Politician);
        // Event.hasMany(models.EventTweet);
      // }
    },
    defaultScope: {
      where: {
        deletedAt: null,
        isPublished: true
      }
    },
    scopes: {
      deleted: {
        where: {
          deletedAt: {ne: null}
        }
      },
      pinned: {
        where: {
          isPinned: true
        }
      },
      published: {
        where: {
          isPublished: true
        }
      },
      draft: {
        where: {
          isPublished: false
        }
      }
  }
  });
  return Event;
};