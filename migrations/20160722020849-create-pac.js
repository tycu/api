'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Pacs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      color: {
        type: Sequelize.STRING
      },
      twitter_username: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(function(results) {
      return queryInterface.addIndex(
        'Pacs',
        ['name'],
        {indexName: 'xi_name_pac'}
      )
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Pacs');
  }
};