'use strict';

module.exports = function(sequelize, DataTypes) {
  var Sequelize = require('sequelize');
  var User = sequelize.define('User', {
    id: {
      type: Sequelize.INTEGER,
      field: 'id',
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
    cityStateZip: {
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
    passwordSalt: {
      type: Sequelize.STRING
    },
    persistenceToken: {
      type: Sequelize.STRING
    },
    singleAccessToken: {
      type: Sequelize.STRING
    },
    perishableToken: {
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
    instanceMethods: {
      // createSalt: function() {
      //   return crypto.randomBytes(128).toString('base64');
      // },
      // hashPassword: function(salt, pwd) {
      //   var hmac = crypto.createHmac('sha1', salt);

      //   return hmac.update(pwd).digest('hex');
      // },
      // authenticate: function(passwordToMatch) {
      //   return this.hashPassword(this.salt, passwordToMatch) === this.hashed_pwd;
      // }
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


// User.sync({force: true}).then(function () {
//   // Table created
//   return User.create({
//     firstName: 'John',
//     lastName: 'Hancock'
//   });
// });
