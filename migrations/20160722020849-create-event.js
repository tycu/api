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
        'Events',
        ['is_pinned'],
        {indexName: 'xi_pinned_event'}
      )
    }).then(function(results) {
      return queryInterface.addIndex(
        'Events',
        ['politician_id'],
        {indexName: 'xi_politician_event'}
      )
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Pacs');
  }
};