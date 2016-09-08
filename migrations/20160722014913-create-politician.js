'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Politicians', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      thumbnail: {
        type: Sequelize.STRING
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      fullName: {
        type: Sequelize.STRING
      },
      jobTitle: {
        type: Sequelize.STRING
      },
      color: {
        type: Sequelize.STRING,
        // allowNull: false // NOTE should require
      },
      colorType: {
        type: Sequelize.INTEGER,
        // allowNull: false // NOTE should require/use
      },
      twitterUsername: {
        type: Sequelize.STRING
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
        'Politicians',
        ['color'],
        {indexName: 'xi_color_politician'}
      );
    });
  },
  down: function(queryInterface) { // NOTE could be (queryInterface, Sequelize)
    queryInterface.removeIndex('Events', 'xi_politician_event');
    queryInterface.removeColumn('Events', 'politicianId');

    // NOTE this isn't great but was having trouble with it
    queryInterface.dropTable('Events');
    return queryInterface.dropTable('Politicians');
  }
};