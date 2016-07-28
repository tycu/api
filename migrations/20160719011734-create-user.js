'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
        type: Sequelize.CHAR,
        allowNull: false
      },
      passwordSalt: {
        type: Sequelize.STRING,
        allowNull: false
      },
      persistenceToken: {
        type: Sequelize.CHAR,
        allowNull: false
      },
      singleAccessToken: {
        type: Sequelize.CHAR,
        allowNull: false
      },
      perishableToken: {
        type: Sequelize.STRING,
        allowNull: false
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
        {indexName: 'xi'}
      )
    }).then(function(results) {
      return queryInterface.addIndex(
        'Users',
        ['singleAccessToken'],
        {indexName: 'xi_single_access_token_user'}
      )
    }).then(function(results) {
      return queryInterface.addIndex(
        'Users',
        ['persistenceToken'],
        {indexName: 'xi_persistence_token_user'}
      )
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Users');
  }
};