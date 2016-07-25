'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('EventTweets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tweetContent: {
        type: Sequelize.STRING
      },
      event_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Events',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
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
        'EventTweets',
        ['event_id'],
        {indexName: 'xi_event_event_tweet'}
      )
    }).then(function(results) {
      return queryInterface.addIndex(
        'EventTweets',
        ['user_id'],
        {indexName: 'xi_user_event_tweet'}
      )
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('EventTweets');
  }
};