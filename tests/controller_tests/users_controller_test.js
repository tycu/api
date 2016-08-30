const should    = require('should'),
      assert    = require('assert'),
      supertest = require('supertest'),
      api       = supertest('http://localhost:5000')

module.exports = function (models, api, data) {
  // console.log('dataaaaaaaa', data);
  describe('events_controller_tests', function() {
    describe('GET /api/v1/users/:id', function() {
      it('should require authorization', function(done) {
        api
        .get('/api/v1/users/1')
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



      // NOTE need to get Authorize.js to comply to get this working
      // NEED to pass request current user of a role of admin for it to work

      // it('should return /api/v1/users/:id', function(done) {
      //   if (data.token && data.id) {
      //     console.log('data.id', data.id);
      //     console.log('data.token', data.token);

      //     api
      //     .get('/api/v1/users/' + data.id)
      //     .set('authorization', 'Bearer ' + data.token)
      //     .expect(200)
      //     .expect('Content-Type', 'application/json; charset=utf-8')
      //     .end(function(err, res) {
      //       if (err) {
      //         throw err;
      //       }
      //       console.log('res.body', res.body);

      //       var user = res.body;
      //       user.id.should.be.instanceof(Number);
      //       // user.name.should.be.instanceof(String);
      //       // user.description.should.be.instanceof(String);
      //       // user.color.should.be.instanceof(String);
      //       // user.twitterUsername.should.be.instanceof(String);
      //       // user.createdAt.should.be.instanceof(String);
      //       // user.updatedAt.should.be.instanceof(String);

      //       done();
      //     });
      //   } else {
      //     done();
      //   }
      // });

    });
  });
}
