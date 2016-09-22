'use strict';

module.exports = {
  up: function (queryInterface) { // NOTE can receive(, Sequelize)
    const seedModel = require('../seed_data/events_seed.js'),
          instances = [];

    let instanceObject;
    let count = 0

    for (const k in seedModel) {
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];
        // console.log('instanceObject', instanceObject);

        count++;
        var imageUrl = instanceObject.imageUrl;
        if (count > 103) {
          // NOTE so we're not hitting tally image service in dev as much
          imageUrl = 'http://www.aviewoncities.com/img/washington/kveus1179s.jpg';
        }


        instances.push({
          // id: parseInt(instanceObject.iden, 10),
          imageAttribution: instanceObject.imageAttribution,
          imageUrl: imageUrl,
          politicianId: instanceObject.politician,
          headline: instanceObject.headline,
          summary: instanceObject.summary,
          isPinned: false,
          isPublished: true,
          // instanceObject.tweets,
          // instanceObject.supportPacs,
          // instanceObject.opposePacs,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    // console.log('instances', instances);
    // console.log('instances.length', instances.length);
    return queryInterface.bulkInsert('Events', instances, {});
  },

  down: function (queryInterface) { // NOTE can receive(, Sequelize)
    return queryInterface.bulkDelete('Events', null, {});
  }
};
