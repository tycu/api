'use strict';

module.exports = function(sequelize, DataTypes) {
  var Sequelize = require('sequelize');
  var bcrypt = require('bcrypt');
  var User = sequelize.define('User', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    facebookUuid: {
      type: Sequelize.STRING
    },
    occupation: {
      type: Sequelize.STRING
    },
    employer: {
      type: Sequelize.STRING
    },
    streetAddress: {
      type: Sequelize.STRING
    },
    city: {
      type: Sequelize.STRING
    },
    residenceState: {
      type: Sequelize.STRING
    },
    zip: {
      type: Sequelize.STRING
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
      },
      findById: function(id, done) {
        process.nextTick(function() {
          var idx = id - 1;
          if (records[idx]) {
            done(null, records[idx]);
          } else {
            done(new Error('User ' + id + ' does not exist'));
          }
        });
      },
      findByUsername: function(username, done) {
        process.nextTick(function() {
          for (var i = 0, len = records.length; i < len; i++) {
            var record = records[i];
            if (record.username === username) {
              return done(null, record);
            }
          }
          return done(null, null);
        });
      }
    },
    instanceMethods: {
       setPassword: function(passwordPlainText, done) {
        var that = this;
        const saltRounds = 10;

        bcrypt.hash(passwordPlainText, saltRounds, function(err, hash) {
            that.cryptedPassword = hash;
            done(that);
        });
      },
      verifyPassword: function(password, cb) {
        bcrypt.compare(password, this.password, cb);
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
