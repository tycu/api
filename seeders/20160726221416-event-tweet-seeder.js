'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    var seedModel = require('../seed_data/events_seed.js');
    // console.log('seedModel', seedModel);
    var instances = [];
    var instanceObject;
    var tweets;

    for (var k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];

        // console.log('instanceObject', instanceObject);
        tweets = instanceObject['tweets'];
        // console.log('tweets', tweets);

        for (var k in tweets){
          instances.push({
            tweetContent: tweets[k],
            pacId: k,
            eventId: parseInt(instanceObject.iden, 10),
            userId: null,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }
    // console.log('instances', instances);
    return queryInterface.bulkInsert('EventTweets', instances, {});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('EventTweets', null, {});
  }
};
