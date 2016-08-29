const should    = require('should'),
      assert    = require('assert'),
      supertest = require('supertest'),
      api       = supertest('http://localhost:5000');
      // factory   = require('factory-girl'),
      // Event     = require('../../models/event');
      // eventFactory = require('./factories/EventFactory');

module.exports = function (models, api) {




  describe('GET /api/v1/events', function() {

    it('should require authorization', function(done) {
      api
      .get('/api/v1/events')
      // .set('x-api-key', '123myapikey')
      // .auth('correct', 'credentials')
      .expect(401)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        // console.log('res.text', res.text);
        res.text.should.match(/^UnauthorizedError\: No authorization token was found/);
        done();
    });

  //   it('should return event', function(done) {

  //   api
  //     .get('/api/v1/events')
  //     // .set('x-api-key', '123myapikey')
  //     // .auth('correct', 'credentials')
  //     .expect(200)
  //     .expect('Content-Type', /json/)
  //     .end(function(err, res) {
  //       if (err) {
  //         throw err;
  //       }
  //       // console.log('res.body', res.body);
  //       res.body.should.be.instanceof(Array).and.have.lengthOf(5);

  //       var event = res.body[0];
  //       // console.log('event', event);
  //       event.id.should.be.instanceof(Number);
  //       event.isPinned.should.be.instanceof(Boolean);
  //       event.isPublished.should.be.instanceof(Boolean);
  //       event.imageUrl.should.be.instanceof(String);
  //       event.imageUrl.should.be.instanceof(String);
  //       event.imageAttribution.should.be.instanceof(String);
  //       event.politicianId.should.be.instanceof(Number);
  //       event.headline.should.be.instanceof(String);
  //       event.summary.should.be.instanceof(String);
  //       event.createdAt.should.be.instanceof(String);
  //       event.updatedAt.should.be.instanceof(String);
  //       done();
  //     });
    });
  });

  // describe('GET /api/v1/events/109', function() {
  //   it('should return event', function(done) {

  //   api
  //     .get('/api/v1/events/109')
  //     // .set('x-api-key', '123myapikey')
  //     // .auth('correct', 'credentials')
  //     .expect(200)
  //     .expect('Content-Type', /json/)
  //     .end(function(err, res) {
  //       if (err) {
  //         throw err;
  //       }
  //       // console.log('res.body', res.body);
  //       res.body.should.be.instanceof(Array).and.have.lengthOf(5);

  //       var event = res.body;
  //       // console.log('event', event);
  //       event.id.should.be.instanceof(Number);
  //       event.isPinned.should.be.instanceof(Boolean);
  //       event.isPublished.should.be.instanceof(Boolean);
  //       event.imageUrl.should.be.instanceof(String);
  //       event.imageUrl.should.be.instanceof(String);
  //       event.imageAttribution.should.be.instanceof(String);
  //       event.politicianId.should.be.instanceof(Number);
  //       event.headline.should.be.instanceof(String);
  //       event.summary.should.be.instanceof(String);
  //       event.createdAt.should.be.instanceof(String);
  //       event.updatedAt.should.be.instanceof(String);
  //       done();
  //     });
  //   });
  // });
};