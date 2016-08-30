const should    = require('should'),
      assert    = require('assert'),
      supertest = require('supertest'),
      api       = supertest('http://localhost:5000')

module.exports = function (models, api) {
  describe('GET /api/v1/politicians/1/politician_photos', function() {
    it('should require authorization', function(done) {
      api
      .get('/api/v1/politicians/1/politician_photos')
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

    // it('should return politicians', function(done) {
    //   api
    //   .get('/api/v1/politicians')
    //   .set('Bearer', '123myapikey')
    //   .auth('correct', 'credentials')
    //   .expect(200)
    //   .expect('Content-Type', /json/)
    //   .end(function(err, res) {
    //     if (err) {
    //       throw err;
    //     }
    //     console.log('res.body', res.body);
    //     // res.body.should.be.instanceof(Array).and.have.lengthOf(5);

    //     // var politician = res.body[0];
    //     // console.log('politician', politician);
    //     // politician.id.should.be.instanceof(Number);
    //     // politician.firstName.should.be.instanceof(String);
    //     // politician.lastName.should.be.instanceof(String);
    //     // politician.jobTitle.should.be.instanceof(String);
    //     // politician.twitterUsername.should.be.instanceof(String);
    //     // politician.createdAt.should.be.instanceof(String);
    //     // politician.updatedAt.should.be.instanceof(String);
    //     // done();
    //   });
    });
  });
}
