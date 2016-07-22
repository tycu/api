'use strict';
module.exports = function(sequelize, DataTypes) {
  var Event = sequelize.define('Event', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id'
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      field: 'is_pinned'
    },
    imageUrl: {
      type: DataTypes.STRING,
      field: 'image_url'
    },
    imageAttribution: {
      type: DataTypes.STRING,
      field: 'image_attribution'
    },
    politicianId: {
      type: DataTypes.INTEGER,
      field: 'politician_id'
    },
    headline: {
      type: DataTypes.STRING,
      field: 'headline'
    },
    summary: {
      type: DataTypes.TEXT,
      field: 'summary'
    },
    createdAt: {
      type: Sequelize.DATE
      field: 'created_at'
    },
    updatedAt: {
      type: Sequelize.DATE
      field: 'updated_at'
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Event;
};