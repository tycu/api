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
        type: Sequelize.STRING
      },
      facebook_id: {
        type: Sequelize.CHAR,
        defaultValue: null
      },
      occupation: {
        type: Sequelize.STRING
      },
      employer: {
        type: Sequelize.STRING
      },
      street_address: {
        type: Sequelize.STRING
      },
      city_state_zip: {
        type: Sequelize.STRING
      },
      pic_square: {
        type: Sequelize.STRING
      },
      stripe_customer_id: {
        type: Sequelize.STRING
      },
      crypted_password: {
        type: Sequelize.CHAR,
        allowNull: false
      },
      password_salt: {
        type: Sequelize.STRING,
        allowNull: false
      },
      persistence_token: {
        type: Sequelize.CHAR,
        allowNull: false
      },
      single_access_token: {
        type: Sequelize.CHAR,
        allowNull: false
      },
      perishable_token: {
        type: Sequelize.STRING,
        allowNull: false
      },
      state: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      email_verified: {
        type: 'BOOLEAN',
        defaultValue: '0'
      },
      change_password: {
        type: 'BOOLEAN',
        defaultValue: '0'
      },
      time_zone: {
        type: Sequelize.STRING
      },
      login_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: '0'
      },
      failed_login_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: '0'
      },
      current_login_ip: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      last_login_ip: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      current_login_at: {
        type: Sequelize.DATE,
        defaultValue: null
      },
      last_login_at: {
        type: Sequelize.DATE,
        defaultValue: null
      },
      deleted_at: {
        type: Sequelize.DATE,
        defaultValue: null
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: null
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: null
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Users');
  }
};