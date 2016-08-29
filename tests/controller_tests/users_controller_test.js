const should    = require('should'),
      assert    = require('assert'),
      supertest = require('supertest'),
      api       = supertest('http://localhost:5000')

module.exports = function (models, api) {
  describe('GET /api/v1/users/1', function() {
    it('should require authorization', function(done) {
      api
      .get('/api/v1/users/1')
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

    // it('should return api/v1/pacs', function(done) {
    //   api
    //   .get('pac_events')
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

    //     // var pacEvent = res.body[0];
    //     // console.log('politician', politician);
          // pac.id.should.be.instanceof(Number);
          // pac.name.should.be.instanceof(String);
          // pac.description.should.be.instanceof(String);
          // pac.color.should.be.instanceof(String);
          // pac.twitterUsername.should.be.instanceof(String);
          // pac.createdAt.should.be.instanceof(String);
          // pac.updatedAt.should.be.instanceof(String);

    //     // done();
    //   });
    });
  });
}
