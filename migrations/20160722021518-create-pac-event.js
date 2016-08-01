'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('PacEvents', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      support: {
        type: Sequelize.BOOLEAN
      },
      eventId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Events',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      pacId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Pacs',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
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
        'PacEvents',
        ['eventId'],
        {indexName: 'xi_event_pac_event'}
      )
    }).then(function(results) {
      return queryInterface.addIndex(
        'PacEvents',
        ['pacId'],
        {indexName: 'xi_pac_pac_event'}
      )
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('PacEvents');
  }
};