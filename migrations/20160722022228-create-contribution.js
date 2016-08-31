'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Contributions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      amount: {
        type: Sequelize.DECIMAL
      },
      support: {
        type: Sequelize.BOOLEAN
      },
      chargeUuid: {
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      eventId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'Events',
            key: 'id'        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      pacId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Pacs',
          key: 'id'        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
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
        'Contributions',
        ['userId'],
        {indexName: 'xi_user_contribution'}
      );
    }).then(function() {
      return queryInterface.addIndex(
        'Contributions',
        ['eventId'],
        {indexName: 'xi_event_contribution'}
      );
    }).then(function() {
      return queryInterface.addIndex(
        'Contributions',
        ['pacId'],
        {indexName: 'xi_pac_contribution'}
      );
    });
  },
  down: function(queryInterface) { // NOTE could be (queryInterface, Sequelize)
    return queryInterface.dropTable('Contributions');
  }
};