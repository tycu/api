const should    = require('should'),
      assert    = require('assert'),
      supertest = require('supertest'),
      api       = supertest('http://localhost:5001')

module.exports = function (models, api, token) {

  var politicianId,
      politicianPhotoId;

  describe('politician_photos_controller_tests', function() {

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
        politicianId = newPolitician.id;
        const newPoliticianPhoto = models.PoliticianPhoto.build({
          politicianId: politicianId,
          url: 'www.politicianPhoto.com',
          main: false,
          updatedAt: Date.now() / 1000
        })
        newPoliticianPhoto.save(function(err) {
        }).then(function(newPoliticianPhoto) {
          politicianPhotoId = newPoliticianPhoto.id;
          done();
        });
      });
    });

    after(function(done) {
      models.Politician.findAll({attributes: ['id'], paranoid: false})
      .then(function(all){
        var ids = [];
        all.forEach(function(instance) {
          ids.push(instance.dataValues.id)
        })
        models.Politician.destroy({force: true, where: {id: ids}});
        done();
      });
    });


    describe('GET /api/v1/politicians/:politicianId/politician_photos', function() {
      it('should require authorization', function(done) {
        api
        .get('/api/v1/politicians/' + politicianId + '/politician_photos')
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

      it('should return politician_photos', function(done) {
        if (token) {
          api
          .get('/api/v1/politicians/' + politicianId + '/politician_photos')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            res.body.should.be.instanceof(Array).and.have.lengthOf(1);

            var politicianPhoto = res.body[0];
            politicianPhoto.id.should.be.instanceof(Number);
            politicianPhoto.politicianId.should.be.instanceof(Number);
            politicianPhoto.url.should.be.instanceof(String);
            politicianPhoto.main.should.be.instanceof(Boolean);
            politicianPhoto.updatedAt.should.be.instanceof(String);
            done();
          });
        } else {
          done();
        }
      });


      it('should return politician_photo', function(done) {
        if (token) {
          api
          .get('/api/v1/politicians/' + politicianId + '/politician_photos/' + politicianPhotoId)
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) {
              throw err;
            }

            var politicianPhoto = res.body;
            politicianPhoto.id.should.be.instanceof(Number);
            politicianPhoto.politicianId.should.be.instanceof(Number);
            politicianPhoto.url.should.be.instanceof(String);
            politicianPhoto.main.should.be.instanceof(Boolean);
            politicianPhoto.updatedAt.should.be.instanceof(String);
            done();
          });
        } else {
          done();
        }
      });


    });
  });
}
