'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id: {
        type: Sequelize.INTEGER
      },
      is_pinned: {
        type: Sequelize.BOOLEAN
      },
      image_url: {
        type: Sequelize.STRING
      },
      image_attribution: {
        type: Sequelize.STRING
      },
      politician_id: {
        type: Sequelize.INTEGER
      },
      headline: {
        type: Sequelize.STRING
      },
      summary: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Events');
  }
};