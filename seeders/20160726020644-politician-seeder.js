'use strict';
var fs   = require("fs");
var path = require("path");

module.exports = {
  up: function (queryInterface, Sequelize) {
    var seedModel = require('../seed_data/politicians_seed.js');
    // console.log('userSeed', seedModel);
    var instances = [];
    var instanceObject;
    var firstLast;

    for (var k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];
        firstLast = instanceObject.name.split(' ');

        // console.log('firstLast', firstLast);
        // console.log('instanceObject', instanceObject);

        instances.push({
          thumbnail: instanceObject.thumbnails[0],
          first_name: firstLast[0],
          last_name: firstLast[firstLast.length-1],
          job_title: instanceObject.jobTitle,
          twitter_username: instanceObject.twitterUsername,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }
    // console.log('instances', instances);
    return queryInterface.bulkInsert('Politicians', instances, {});
  },

  down: function (queryInterface, Sequelize) {
  //   return queryInterface.bulkDelete('Politicians', null, {});
  }
};
