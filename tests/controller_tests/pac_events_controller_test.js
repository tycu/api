const should    = require('should'),
      assert    = require('assert'),
      supertest = require('supertest'),
      api       = supertest('http://localhost:5001')

module.exports = function (models, api, token) {

  var pacId,
      eventId,
      pacEventId;

  describe('pac_events_controller_tests', function() {

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

          const newPac = models.Pac.build({
            name: 'Test PacName',
            description: 'Raising money, asyncronously.',
            color: 'blue',
            twitterUsername: 'tweetAtMyPac',
            updatedAt: Date.now() / 1000
          })
          .save(function(newPac) {})
          .then(function(newPac) {
            pacId = newPac.id;

            const newPacEvent = models.PacEvent.build({
              support: true,
              eventId: eventId,
              pacId: pacId,
              updatedAt: Date.now() / 1000
            })
            .save(function(newPacEvent) {})
            .then(function(newPacEvent) {
              pacEventId = newPacEvent.id
              done();
            });
          });
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
        models.Event.destroy({force: true, where: {id: ids}});

        models.Politician.findAll({attributes: ['id'], paranoid: false})
        .then(function(all){
          var ids = [];
          all.forEach(function(instance) {
            ids.push(instance.dataValues.id)
          })
          models.Politician.destroy({force: true, where: {id: ids}});
          done()
        });
      })
    });


    describe('GET /api/v1/events/:eventId/pac_events', function() {
      it('should require authorization', function(done) {
        api
        .get('/api/v1/events/' + eventId + '/pac_events')
        .expect(401)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.text.should.match(/^UnauthorizedError\: No authorization token was found/);
          done();
        });
      });

      it('should return /api/v1/events/:eventId/pac_events', function(done) {

        if (token) {
          api
          .get('/api/v1/events/' + eventId + '/pac_events')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            // console.log('res.body', res.body);
            res.body.should.be.instanceof(Array).and.have.lengthOf(1);

            var pacEvent = res.body[0];
            pacEvent.id.should.be.instanceof(Number);
            pacEvent.eventId.should.be.instanceof(Number);
            pacEvent.pacId.should.be.instanceof(Number);
            pacEvent.support.should.be.instanceof(Boolean);
            pacEvent.createdAt.should.be.instanceof(String);
            pacEvent.updatedAt.should.be.instanceof(String);
            done();
          });
        } else {
          done();
        }
      });
    });


    describe('GET /api/v1/events/:eventId/pac_events/:id', function() {
      it('should return event', function(done) {

        if (token) {
          api
          .get('/api/v1/events/' + eventId + '/pac_events/' + pacEventId)
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) {
              throw err;
            }

            var pacEvent = res.body;
            pacEvent.id.should.be.instanceof(Number);
            pacEvent.eventId.should.be.instanceof(Number);
            pacEvent.pacId.should.be.instanceof(Number);
            pacEvent.support.should.be.instanceof(Boolean);
            pacEvent.createdAt.should.be.instanceof(String);
            pacEvent.updatedAt.should.be.instanceof(String);
            done();
          });
        } else {
          done();
        }
      });
    });



  });
}
