'use strict';
const uuid = require('uuid');

module.exports = {
  up: function (queryInterface) { // NOTE can receive(, Sequelize)
    const seedModel = require('../seed_data/users_seed.js'),
          instances = [],
          colorTypes = require('../models/enums/colorTypes');
    let instanceObject;

    for (const k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);

        instanceObject = seedModel[k];
        instances.push({
          // NOTE don't seed user so we can init postgres sequence
          // see stuff about sequelize issues with PG sequence
          // id: parseInt(instanceObject.iden, 10),

          name: instanceObject.name,
          facebookUuid: instanceObject.facebookId,
          email: instanceObject.email,
          role: instanceObject.role || 'user',
          colorType: colorTypes.get('undecided').value,
          color: colorTypes.get('undecided').key,
          createdAt:  new Date(),
          updatedAt: new Date(),
          cryptedPassword: '',
          refreshToken: uuid.v4()
        });
      }
    }
    // console.log('instances', instances);
    return queryInterface.bulkInsert('Users', instances, {});
  },

  down: function (queryInterface) { // NOTE can receive(, Sequelize)
    return queryInterface.bulkDelete('Users', null, {});
  }
};
