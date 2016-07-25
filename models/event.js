'use strict';
module.exports = function(sequelize, DataTypes) {
  var Sequelize = require('sequelize');
  var Event = sequelize.define('Event', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
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
      type: Sequelize.DATE,
      field: 'created_at'
    },
    updatedAt: {
      type: Sequelize.DATE,
      field: 'updated_at'
    }
  }, {
    underscored: true,
    paranoid: true,
    classMethods: {
      associate: function(models) {
        Event.hasMany(models.Contribution)
        Event.belongsTo(models.Politician);
        Event.hasMany(models.EventTweet)
      }
    }
  });
  return Event;
};