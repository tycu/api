'use strict';
var fs   = require("fs");
var path = require("path");

module.exports = {
  up: function (queryInterface, Sequelize) {
    var seedModel = require('../seed_data/pacs_seed.js');
    // console.log('seedModel', seedModel);
    var instances = [];
    var instanceObject;


    for (var k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];
        instances.push({
          // id: parseInt(instanceObject.iden, 10),
          name: instanceObject.name,
          description: instanceObject.description,
          color: instanceObject.color,
          twitterUsername: instanceObject.twitterUsername,
          createdAt:  new Date(),
          updatedAt: new Date()
        });
      }
    }
    // console.log('instances', instances);
    return queryInterface.bulkInsert('Pacs', instances, {});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Pacs', null, {});
  }
};
