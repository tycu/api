'use strict';

const should = require('should'),
      assert = require('assert'),
      supertest = require('supertest'),
      api = supertest('http://localhost:5000');

// http://shouldjs.github.io/
// https://github.com/visionmedia/supertest

module.exports = function (models, api) {
  describe('GET /', function() {
    it('should return ping', function(done) {

    api
      .get('/')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        // console.log('res.body', res.body);

        res.body.should.have.property('revitalizingDemocracy').and.be.instanceof(Boolean);
        done();
      });
    });
  });
}
