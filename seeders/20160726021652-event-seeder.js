'use strict';
var fs   = require("fs");
var path = require("path");

module.exports = {
  up: function (queryInterface, Sequelize) {
    var seedModel = require('../seed_data/events_seed.js');
    // console.log('seedModel', seedModel);
    var instances = [];
    var instanceObject;

    for (var k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];
        // console.log('instanceObject', instanceObject);

        instances.push({
          id: instanceObject.iden,
          image_attribution: instanceObject.imageAttribution,
          image_url: instanceObject.imageUrl,
          politician_id: instanceObject.politician,
          headline: instanceObject.headline,
          summary: instanceObject.summary,
          is_pinned: false,
          // instanceObject.tweets,
          // instanceObject.supportPacs,
          // instanceObject.opposePacs,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
    // console.log('instances', instances);
    // console.log('instances.length', instances.length);
    return queryInterface.bulkInsert('Events', instances, {});
  },

  down: function (queryInterface, Sequelize) {
  //   return queryInterface.bulkDelete('Events', null, {});
  }
};
