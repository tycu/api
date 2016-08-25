'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('EventTweets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      tweetContent: {
        type: Sequelize.STRING
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
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
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
    }).then(function() { // NOTE could be (results)
      return queryInterface.addIndex(
        'EventTweets',
        ['pacId'],
        {indexName: 'xi_pac_event_tweet'}
      );
    }).then(function() {
      return queryInterface.addIndex(
        'EventTweets',
        ['eventId'],
        {indexName: 'xi_event_event_tweet'}
      );
    }).then(function() {
      return queryInterface.addIndex(
        'EventTweets',
        ['userId'],
        {indexName: 'xi_user_event_tweet'}
      );
    });
  },
  down: function(queryInterface) { // NOTE could be (queryInterface, Sequelize)
    return queryInterface.dropTable('EventTweets');
  }
};