'use strict';

module.exports = {
  up: function (queryInterface) { // NOTE can receive(, Sequelize)
    const seedModel = require('../seed_data/politicians_seed.js'),
          instances = [];

    let instanceObject,
        firstLast;

    for (const k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];
        firstLast = instanceObject.name.split(' ');

        // console.log('firstLast', firstLast);
        // console.log('instanceObject', instanceObject);

        instances.push({
          // id: instanceObject.iden,
          thumbnail: instanceObject.thumbnails[0],
          firstName: firstLast[0],
          lastName: firstLast[firstLast.length-1],
          fullName: instanceObject.name,
          jobTitle: instanceObject.jobTitle,
          twitterUsername: instanceObject.twitterUsername,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    // console.log('instances', instances);
    return queryInterface.bulkInsert('Politicians', instances, {});
  },

  down: function (queryInterface) { // NOTE can receive(, Sequelize)
    return queryInterface.bulkDelete('Politicians', null, {});
  }
};
