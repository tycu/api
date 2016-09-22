'use strict';

module.exports = {
  up: function (queryInterface) { // NOTE can receive(, Sequelize)
    const seedModel = require('../seed_data/events_seed.js'),
          instances = [];

    let instanceObject,
        tweets;

    for (const k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];

        // console.log('instanceObject', instanceObject);
        tweets = instanceObject.tweets;
        // console.log('tweets', tweets);

        for (const i in tweets){
          instances.push({
            tweetContent: tweets[i],
            pacId: i,
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

  down: function (queryInterface) { // NOTE can receive(, Sequelize)
    return queryInterface.bulkDelete('EventTweets', null, {});
  }
};
