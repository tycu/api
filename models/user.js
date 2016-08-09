'use strict';

// NOTE Validations
// http://docs.sequelizejs.com/en/latest/docs/models-definition/#validations

module.exports = function(sequelize, DataTypes) {
  var Sequelize = require('sequelize');
  var bcrypt = require('bcrypt');
  var env = process.env.NODE_ENV || "development";
  var jwtConfig = require('../config/jwtOptions.json')[env];
  var uuid = require('uuid');

  var User = sequelize.define('User', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      }
    },
    facebookUuid: {
      type: Sequelize.STRING
    },
    occupation: {
      type: Sequelize.STRING,
      validate: {
        len: [0,100]
      }
    },
    employer: {
      type: Sequelize.STRING,
      validate: {
        len: [0,100]
      }
    },
    streetAddress: {
      type: Sequelize.STRING,
      validate: {
        len: [0,100]
      }
    },
    city: {
      type: Sequelize.STRING,
      validate: {
        len: [0,100]
      }
    },
    residenceState: {
      type: Sequelize.STRING
    },
    zip: {
      type: Sequelize.STRING,
      validate: {
        len: [5,12]
      }
    },
    color: {
      type: Sequelize.STRING
    },
    picSquare: {
      type: Sequelize.STRING
    },
    stripeCustomerUuid: {
      type: Sequelize.STRING
    },
    cryptedPassword: {
      type: Sequelize.STRING
    },
    refreshToken: {
      type: Sequelize.STRING
    },
    state: {
      type: Sequelize.STRING
    },
    emailVerified: {
      type: DataTypes.BOOLEAN
    },
    changePassword: {
      type: DataTypes.BOOLEAN
    },
    timeZone: {
      type: Sequelize.STRING
    },
    loginCount: {
      type: Sequelize.INTEGER
    },
    failedLoginCount: {
      type: Sequelize.INTEGER
    },
    currentLoginIp: {
      type: Sequelize.STRING
    },
    lastLoginIp: {
      type: Sequelize.STRING
    },
    currentLoginAt: {
      type: Sequelize.DATE
    },
    lastLoginAt: {
      type: Sequelize.DATE
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
        User.hasMany(models.Contribution);
        User.hasMany(models.EventTweet);
      }
    },
    hooks: {
      beforeCreate: function(user, options) {
        user.refreshToken = uuid.v4()
      }
    },
    instanceMethods: {
      setPassword: function(passwordPlainText, cb) {
        var that = this;
        const saltRounds = 10;

        bcrypt.hash(passwordPlainText, saltRounds, function(err, hash) {
          if (err) {
            return cb(err);
          }
          that.cryptedPassword = hash;
          cb(that);
        });
      },
      comparePassword: function(password, cb) {
        var that = this;
        var hash = that.cryptedPassword;

        bcrypt.compare(password, hash, function(err, isMatch) {
          if (err) {
            return cb(err);
          }
          cb(null, isMatch);
        });
      }
    },
    defaultScope: {
      where: {
        isDeleted: false
      }
    },
    scopes: {
      deleted: {
        where: {
          isDeleted: true
        }
      }
    }
  });
  return User;
};
