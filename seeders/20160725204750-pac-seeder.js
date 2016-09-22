'use strict';

module.exports = {
  up: function (queryInterface) { // NOTE can receive(, Sequelize)
    const seedModel = require('../seed_data/pacs_seed.js'),
          instances = [],
          colorTypes = require('../models/enums/colorTypes');
    let instanceObject;

    for (const k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];
        var colorType = colorTypes.get(instanceObject.color).value;

        instances.push({
          // id: parseInt(instanceObject.iden, 10),

          name: instanceObject.name,
          description: instanceObject.description,
          color: instanceObject.color,
          colorType: colorType,
          twitterUsername: instanceObject.twitterUsername,
          createdAt:  new Date(),
          updatedAt: new Date()
        });
      }
    }
    // console.log('instances', instances);
    return queryInterface.bulkInsert('Pacs', instances, {});
  },

  down: function (queryInterface) { // NOTE can receive(, Sequelize)
    return queryInterface.bulkDelete('Pacs', null, {});
  }
};
