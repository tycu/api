'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
        unique: true
      },
      facebookUuid: {
        type: Sequelize.CHAR,
        defaultValue: null
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
        type: Sequelize.STRING,
        allowNull: false
      },
      refreshToken: {
        type: Sequelize.STRING
      },
      singleUseToken: {
        type: Sequelize.STRING,
      },
      state: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      emailVerified: {
        type: 'BOOLEAN',
        defaultValue: false
      },
      changePassword: {
        type: 'BOOLEAN',
        defaultValue: false
      },
      timeZone: {
        type: Sequelize.STRING
      },
      loginCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: '0'
      },
      failedLoginCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: '0'
      },
      currentLoginIp: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      lastLoginIp: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      currentLoginAt: {
        type: Sequelize.DATE,
        defaultValue: null
      },
      lastLoginAt: {
        type: Sequelize.DATE,
        defaultValue: null
      },
      deletedAt: {
        type: Sequelize.DATE,
        defaultValue: null
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: null
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: null
      }
    }).then(function(results) {
      return queryInterface.addIndex(
        'Users',
        ['email'],
        {indexName: 'xi_email_users'}
      )
    })
    .then(function(results) {
      return queryInterface.addIndex(
        'Users',
        ['singleUseToken'],
        {indexName: 'xi_single_use_token_users'}
      )
    })
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Users');
  }
};