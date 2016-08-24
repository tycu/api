'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Events', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      isPinned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isPublished: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      imageUrl: {
        type: Sequelize.STRING
      },
      imageAttribution: {
        type: Sequelize.STRING
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
      headline: {
        type: Sequelize.STRING
      },
      summary: {
        type: Sequelize.TEXT
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
        'Events',
        ['isPinned'],
        {indexName: 'xi_pinned_event'}
      )
    }).then(function(results) {
      return queryInterface.addIndex(
        'Events',
        ['isPublished'],
        {indexName: 'xi_is_published_event'}
      )
    }).then(function(results) {
      return queryInterface.addIndex(
        'Events',
        ['politicianId'],
        {indexName: 'xi_politician_event'}
      )
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Pacs');
  }
};