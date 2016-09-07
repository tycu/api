'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Pacs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      twitterUsername: {
        type: Sequelize.STRING
      },
      pacType: {
        type: Sequelize.INTEGER,
        // allowNull: false
      },
      deletedAt: {
        type: Sequelize.DATE,
        defaultValue: null
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(function() { // NOTE could be (results)
      return queryInterface.addIndex(
        'Pacs',
        ['name'],
        {indexName: 'xi_name_pac'}
      );
    }).then(function() {
      return queryInterface.addIndex(
        'Pacs',
        ['color'],
        {indexName: 'xi_color_pac'}
      );
    });
  },
  down: function(queryInterface) { // NOTE could be (queryInterface, Sequelize)
    return queryInterface.dropTable('Pacs');
  }
};