const should    = require('should'),
      assert    = require('assert'),
      supertest = require('supertest'),
      api       = supertest('http://localhost:5001')

module.exports = function (models, api, token) {
  var pacId;

  describe('pacs_controller_tests', function() {
    before(function(done) {
      const newPac = models.Pac.build({
        name: 'Test PacName',
        description: 'Raising money, asyncronously.',
        color: 'blue',
        streetAddress: '123 Main Street',
        city: 'Etna',
        mailingState: 'NH',
        zip: '12345',
        twitterUsername: 'tweetAtMyPac',
        updatedAt: Date.now() / 1000
      })
      .save(function(newPac) {})
      .then(function(newPac) {
        pacId = newPac.id;
        done();
      });
    });

    after(function(done) {
      models.Pac.findAll({attributes: ['id'], paranoid: false})
      .then(function(all){
        var ids = [];
        all.forEach(function(instance) {
          ids.push(instance.dataValues.id)
        })
        models.Pac.destroy({force: true, where: {id: ids}});
        done();
      })
    });

    describe('GET /api/v1/pacs', function() {
      it('should require authorization', function(done) {
        api
        .get('/api/v1/pacs')
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

      it('should return /api/v1/pacs', function(done) {
        if (token) {
          api
          .get('/api/v1/pacs')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            // console.log('res.body', res.body);
            res.body.should.be.instanceof(Array).and.have.lengthOf(2);

            var pac = res.body[0];
            pac.id.should.be.instanceof(Number);
            pac.name.should.be.instanceof(String);
            pac.description.should.be.instanceof(String);
            pac.color.should.be.instanceof(String);
            pac.streetAddress.should.be.instanceof(String);
            pac.city.should.be.instanceof(String);
            pac.mailingState.should.be.instanceof(String);
            pac.zip.should.be.instanceof(String);
            pac.twitterUsername.should.be.instanceof(String);
            pac.createdAt.should.be.instanceof(String);
            pac.updatedAt.should.be.instanceof(String);
            done();
          });

        } else {
          done();
        }
      });
    });


    describe('GET /api/v1/pacs/:id', function() {
      it('should return event', function(done) {

        if (token) {
          api
          .get('/api/v1/pacs/' + pacId)
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) {
              throw err;
            }

            var pac = res.body;
            pac.id.should.be.instanceof(Number);
            pac.name.should.be.instanceof(String);
            pac.description.should.be.instanceof(String);
            pac.color.should.be.instanceof(String);
            pac.twitterUsername.should.be.instanceof(String);
            pac.createdAt.should.be.instanceof(String);
            pac.updatedAt.should.be.instanceof(String);
            done();
          });
        } else {
          done();
        }
      });
    });

  });
};
