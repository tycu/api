'use strict';

// NOTE Validations
// http://docs.sequelizejs.com/en/latest/docs/models-definition/#validations

module.exports = function(sequelize, DataTypes) {
  const Sequelize = require('sequelize');
  const bcrypt = require('bcrypt');
  const uuid = require('uuid');

  const User = sequelize.define('User', {
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
        isEmail: true
      }
    },
    facebookUuid: {
      type: Sequelize.STRING
    },
    occupation: {
      type: Sequelize.STRING,
      validate: {
        len: [0, 100]
      }
    },
    employer: {
      type: Sequelize.STRING,
      validate: {
        len: [0, 100]
      }
    },
    streetAddress: {
      type: Sequelize.STRING,
      validate: {
        len: [0, 100]
      }
    },
    city: {
      type: Sequelize.STRING,
      validate: {
        len: [0, 100]
      }
    },
    residenceState: {
      type: Sequelize.STRING
    },
    zip: {
      type: Sequelize.STRING,
      validate: {
        len: [5, 12]
      }
    },
    color: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isIn: [['blue', 'red', 'undecided', 'independent']]
      }
    },
    colorType: {
      type: Sequelize.INTEGER,
      // allowNull: false
    },
    picSquare: {
      type: Sequelize.STRING
    },
    stripeCustomerUuid: {
      type: Sequelize.STRING
    },
    cryptedPassword: {
      type: Sequelize.STRING,
      allowNull: false
    },
    refreshToken: {
      type: Sequelize.STRING
    },
    singleUseToken: {
      type: Sequelize.STRING
    },
    state: {
      type: Sequelize.STRING
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isIn: [['user', 'admin']]
      }
    },
    emailVerified: {
      type: DataTypes.BOOLEAN
    },
    resetPassword: {
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
      associate: function(models) {
        User.hasMany(models.Contribution);
        User.hasMany(models.EventTweet);
      }
    },
    hooks: {
      beforeCreate: function(user) { // NOTE can be (user, options)
        user.refreshToken = uuid.v4();
      }
    },
    instanceMethods: {
      setPassword: function(passwordPlainText, cb) {
        const that = this,
              saltRounds = 10;

        bcrypt.hash(passwordPlainText, saltRounds, function(err, hash) {
          if (err) {
            return cb(err);
          }
          that.cryptedPassword = hash;
          cb(that);
        });
      },
      comparePassword: function(password, cb) {
        const that = this;
        const hash = that.cryptedPassword;

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
        deletedAt: null
      }
    },
    scopes: {
      deleted: {
        where: {
          deletedAt: {ne: null}
        }
      }
    }
  });
  return User;
};
