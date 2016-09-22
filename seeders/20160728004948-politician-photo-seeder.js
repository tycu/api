'use strict';

module.exports = {
  up: function (queryInterface) { // NOTE can receive(, Sequelize)
    const seedModel = require('../seed_data/politicians_seed.js'),
          instances = [];

    let instanceObject,
        thumbs;

    for (const k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];

        // console.log('instanceObject', instanceObject);
        thumbs = instanceObject.thumbnails;

        for (let i = 0; i < thumbs.length; i++) {
          instances.push({
            politicianId: parseInt(instanceObject.iden, 10),
            url: thumbs[i],
            main: false,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        // console.log('thumbs', thumbs);
      }
    }
    // console.log('instances', instances);
    return queryInterface.bulkInsert('PoliticianPhotos', instances, {});
  },

  down: function (queryInterface) { // NOTE can receive(, Sequelize)
    return queryInterface.bulkDelete('PoliticianPhotos', null, {});
  }
};
