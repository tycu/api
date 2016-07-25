'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Contributions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      amount: {
        type: Sequelize.STRING
      },
      support: {
        type: Sequelize.BOOLEAN
      },
      charge_uuid: {
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      event_id: {
        type: Sequelize.INTEGER,
        references: {
            model: 'Events',
            key: 'id'        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      pac_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Pacs',
          key: 'id'        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
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
        'Contributions',
        ['user_id'],
        {indexName: 'xi_user_contribution'}
      )
    }).then(function(results) {
      return queryInterface.addIndex(
        'Contributions',
        ['event_id'],
        {indexName: 'xi_event_contribution'}
      )
    }).then(function(results) {
      return queryInterface.addIndex(
        'Contributions',
        ['pac_id'],
        {indexName: 'xi_pac_contribution'}
      )
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Contributions');
  }
};