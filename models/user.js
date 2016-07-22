'use strict';
var User = sequelize.define('user', {

  id: {
    type: Sequelize.INTEGER,
    field: 'id'
  },
  name: {
    type: Sequelize.STRING,
    field: 'name'
  },
  email: {
    type: Sequelize.STRING,
    field: 'email'
  },
  facebookId: {
    type: Sequelize.STRING,
    field: 'facebook_id'
  },
  occupation: {
    type: Sequelize.STRING,
    field: 'occupation'
  },
  employer: {
    type: Sequelize.STRING,
    field: 'employer'
  },
  streetAddress: {
    type: Sequelize.STRING,
    field: 'streetAddress'
  },
  cityStateZip: {
    type: Sequelize.STRING,
    field: 'cityStateZip'
  },
  picSquare: {
    type: Sequelize.STRING,
    field: 'pic_square'
  },
  stripeCustomerId: {
    type: Sequelize.STRING,
    field: 'stripe_customer_id'
  },
  cryptedPassword: {
    type: Sequelize.STRING,
    field: 'crypted_password'
  },
  passwordSalt: {
    type: Sequelize.STRING,
    field: 'password_salt'
  },
  persistenceToken: {
    type: Sequelize.STRING,
    field: 'persistence_token'
  },
  singleAccessToken: {
    type: Sequelize.STRING,
    field: 'single_access_token'
  },
  perishableToken: {
    type: Sequelize.STRING,
    field: 'perishable_token'
  },
  state: {
    type: Sequelize.STRING,
    field: 'state'
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    field: 'email_verified'
  },
  changePassword: {
    type: DataTypes.BOOLEAN,
    field: 'change_password'
  },
  timeZone: {
    type: Sequelize.STRING,
    field: 'time_zone'
  },
  loginCount: {
    type: Sequelize.INTEGER,
    field: 'login_count'
  },
  failedLoginCount: {
    type: Sequelize.INTEGER,
    field: 'failed_login_count'
  },
  currentLoginIp: {
    type: Sequelize.STRING,
    field: 'current_login_ip'
  },
  lastLoginIp: {
    type: Sequelize.STRING,
    field: 'last_login_ip'
  },
  currentLoginAt: {
    type: lastLoginAt,
    field: 'current_login_at'
  },
  lastLoginAt: {
    type: lastLoginAt,
    field: 'last_login_at'
  },
  deletedAt: {
    type: Sequelize.DATE,
    field: 'deleted_at'
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
  freezeTableName: true
});

// User.sync({force: true}).then(function () {
//   // Table created
//   return User.create({
//     firstName: 'John',
//     lastName: 'Hancock'
//   });
// });

// module.exports = function(sequelize, DataTypes) {

//   console.log('aaaa', sequelize);
//   console.log('DataTypes:', DataTypes);

//   var User = sequelize.define('User', {
//     username: DataTypes.STRING
//   }, {
//     classMethods: {
//       associate: function(models) {
//         // associations can be defined here
//       }
//     }
//   });
//   return User;
// };