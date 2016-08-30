const should    = require('should'),
      assert    = require('assert'),
      supertest = require('supertest'),
      api       = supertest('http://localhost:5000');
      // factory   = require('factory-girl'),
      // Event     = require('../../models/event');
      // eventFactory = require('./factories/EventFactory');

module.exports = function (models, api, token) {

  var eventId;

  describe('events_controller_tests', function() {
    before(function(done) {
      const newPolitician = models.Politician.build({
        firstName: 'Bob',
        lastName: 'Dole',
        jobTitle: 'President',
        twitterUsername: 'whatIsInternet',
        updatedAt: Date.now() / 1000
      })
      .save(function(newPolitician) {})
      .then(function(newPolitician) {
        const newEvent = models.Event.build({
          isPinned: false,
          isPublished: true,
          imageUrl: 'image.url.com',
          imageAttribution: 'NYT',
          politicianId: newPolitician.id,
          headline: 'Here is an event headline',
          summary: 'Here is an event summary',
          updatedAt: Date.now() / 1000
        })
        .save(function(newEvent) {})
        .then(function(newEvent) {
          eventId = newEvent.id
          done();
        });
      });
    });

    after(function(done) {
      models.Event.findAll({attributes: ['id'], paranoid: false})
      .then(function(all){
        var ids = [];
        all.forEach(function(instance) {
          ids.push(instance.dataValues.id)
        })

        // console.log('ids', ids);
        models.Event.destroy({force: true, where: {id: ids}});

        models.Politician.findAll({attributes: ['id'], paranoid: false})
        .then(function(all){
          var ids = [];
          all.forEach(function(instance) {
            ids.push(instance.dataValues.id)
          })

          // console.log('ids', ids);
          models.Politician.destroy({force: true, where: {id: ids}});
          done()
        });
      })
    });


    describe('GET /api/v1/events', function() {
      it('should require authorization', function(done) {
        api
        .get('/api/v1/events')
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
      });

      it('should return events', function(done) {
        // console.log('inside return events', token);

        if (token) {
          api
          .get('/api/v1/events')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            // console.log('res.body', res);
            res.body.should.be.instanceof(Array).and.have.lengthOf(1);

            var event = res.body[0];
            // // console.log('event', event);
            event.id.should.be.instanceof(Number);
            event.isPinned.should.be.instanceof(Boolean);
            event.isPublished.should.be.instanceof(Boolean);
            event.imageUrl.should.be.instanceof(String);
            event.imageUrl.should.be.instanceof(String);
            event.imageAttribution.should.be.instanceof(String);
            event.politicianId.should.be.instanceof(Number);
            event.headline.should.be.instanceof(String);
            event.summary.should.be.instanceof(String);
            event.createdAt.should.be.instanceof(String);
            event.updatedAt.should.be.instanceof(String);
            done();
          });
        } else {
          done();
        }
      });
    });

    describe('GET /api/v1/events/:id', function() {
      it('should return event', function(done) {

        if (token) {
          api
          .get('/api/v1/events/' + eventId)
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            // console.log('res.body', res.body);

            var event = res.body;
            // console.log('event', event);
            event.id.should.be.instanceof(Number);
            event.isPinned.should.be.instanceof(Boolean);
            event.isPublished.should.be.instanceof(Boolean);
            event.imageUrl.should.be.instanceof(String);
            event.imageUrl.should.be.instanceof(String);
            event.imageAttribution.should.be.instanceof(String);
            event.politicianId.should.be.instanceof(Number);
            event.headline.should.be.instanceof(String);
            event.summary.should.be.instanceof(String);
            event.createdAt.should.be.instanceof(String);
            event.updatedAt.should.be.instanceof(String);
            done();
          });
        } else {
          done();
        }
      });
    });

  })

};