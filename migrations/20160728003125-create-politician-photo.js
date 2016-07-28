'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('PoliticianPhotos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id: {
        type: Sequelize.INTEGER
      },
      politicianId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Politicians',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      url: {
        type: Sequelize.STRING
      },
      main: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    }).then(function(results) {
      return queryInterface.addIndex(
        'PoliticianPhotos',
        ['politicianId'],
        {indexName: 'xi_politician_photos'}
      )
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('PoliticianPhotos');
  }
};