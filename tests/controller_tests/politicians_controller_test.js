const should    = require('should'),
      assert    = require('assert'),
      supertest = require('supertest'),
      api       = supertest('http://localhost:5001'),
      colorTypes = require('../../models/enums/colorTypes');

module.exports = function (models, api, token) {

  var politicianId;

  describe('politicians_controller_tests', function() {
    before(function(done) {
      const newPolitician = models.Politician.build({
        firstName: 'Bob',
        lastName: 'Dole',
        jobTitle: 'President',
        color: 'red',
        colorType: colorTypes.get('red').value,
        twitterUsername: 'whatIsInternet',
        updatedAt: Date.now() / 1000
      })
      .save(function(newPolitician) {})
      .then(function(newPolitician) {
        politicianId = newPolitician.id;
        done();
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


    describe('GET /api/v1/politicians', function() {
      it('should require authorization', function(done) {
        api
        .get('/api/v1/politicians')
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

      it('should return politicians', function(done) {
        if (token) {
          api
          .get('/api/v1/politicians')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            // console.log('res.body', res.body);
            res.body.should.be.instanceof(Array).and.have.lengthOf(1);

            var politician = res.body[0];
            // console.log('politician', politician);
            politician.id.should.be.instanceof(Number);
            politician.firstName.should.be.instanceof(String);
            politician.lastName.should.be.instanceof(String);
            politician.jobTitle.should.be.instanceof(String);
            politician.twitterUsername.should.be.instanceof(String);
            politician.createdAt.should.be.instanceof(String);
            politician.updatedAt.should.be.instanceof(String);
            done();
          });

        } else {
          done();
        }
      });
    });

    describe('GET /api/v1/politicians/:id', function() {
      it('should return event', function(done) {

        if (token) {
          api
          .get('/api/v1/politicians/' + politicianId)
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            // console.log('res.body', res.body);

            var politician = res.body;
            // console.log('politician', politician);
            politician.id.should.be.instanceof(Number);
            politician.firstName.should.be.instanceof(String);
            politician.lastName.should.be.instanceof(String);
            politician.jobTitle.should.be.instanceof(String);
            politician.twitterUsername.should.be.instanceof(String);
            politician.createdAt.should.be.instanceof(String);
            politician.updatedAt.should.be.instanceof(String);
            done();
          });
        } else {
          done();
        }
      });
    });

  });
}
