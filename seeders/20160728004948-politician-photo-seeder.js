'use strict';
var fs   = require("fs");
var path = require("path");

module.exports = {
  up: function (queryInterface, Sequelize) {
    var seedModel = require('../seed_data/politicians_seed.js');
    // console.log('seedModel', seedModel);
    var instances = [];
    var instanceObject;
    var thumbs;
    var firstLast;

    for (var k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];
        firstLast = instanceObject.name.split(' ');

        // console.log('instanceObject', instanceObject);
        thumbs = instanceObject['thumbnails'];

        for (var i = 0; i < thumbs.length; i++) {
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

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('PoliticianPhotos', null, {});
  }
};
