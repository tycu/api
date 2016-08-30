
module.exports = function (models, api) {
  describe('authentication_controller_tests', function(){
    var token,
        newUser,
        email;

    before(function(done) {
      models.User.destroy({truncate: true})
      .then(function() {
        done();
      })
    });

    after(function(done) {

      models.User.findAll({attributes: ['id'],paranoid: false})
      .then(function(allUsers){
        var ids = [];
        allUsers.forEach(function(user) {
          ids.push(user.dataValues.id)
        })

        console.log('ids', ids);
        models.User.destroy({force: true, where: {id: ids}});
        done()
      })
    });

    describe('GET /api/v1/signup', function() {
      it('should create user', function(done) { // NOTE done means async
        email = 'testUser' + Math.random() + '@email.com';
        const body = {
                email: email,
                password: 'HereIsPassword123'
              };

        api
        .post('/api/v1/signup')
        .send(body)
        // .set('x-api-key', '123myapikey')
        // .auth('correct', 'credentials')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          const response = res.body;
          response.should.be.instanceof(Object);
          // console.log('response', response);

          response.id.should.be.instanceof(Number);
          response.email.should.be.instanceof(String)
          response.email.should.be.equal(email);
          response.refreshToken.should.be.instanceof(String);
          response.token.should.be.instanceof(String);
          token = response.token;
          response.role.should.be.instanceof(String);
          response.role.should.equal('user');
          response.token_exp.should.be.instanceof(Number);
          response.token_iat.should.be.instanceof(Number);
          done();

        });
      });
    })
    describe('GET /api/v1/signout', function() {
      it('should sign out user', function(done) {
        // console.log('token', token);

        api
        .put('/api/v1/signout')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          const response = res.body;
          response.should.be.instanceof(Object);
          response.message.should.be.instanceof(String);
          response.message.should.be.equal('User has been successfully logged out');
          done();
        });
      });
    })
    describe('GET /api/v1/signin', function() {
      it('should sign in user', function(done) {
        const body = {
                email: email,
                password: 'HereIsPassword123'
              };
        api
        .post('/api/v1/signin')
        .send(body)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          const response = res.body;
          response.should.be.instanceof(Object);
          // console.log('response', response);

          response.id.should.be.instanceof(Number);
          response.email.should.be.instanceof(String)
          response.email.should.be.equal(email);
          response.refreshToken.should.be.instanceof(String);
          response.token.should.be.instanceof(String);
          token = response.token;
          response.role.should.be.instanceof(String);
          response.role.should.equal('user');
          response.token_exp.should.be.instanceof(Number);
          response.token_iat.should.be.instanceof(Number);
          done();
        });
      });
    })
    describe('GET /api/v1/email_reset', function() {
      it('should sign in user', function(done) {
        const body = {
                email: email,
              };

        api
        .put('/api/v1/email_reset')
        .send(body)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          const response = res.body;
          response.should.be.instanceof(Object);
          response.message.should.be.instanceof(String);
          response.message.should.be.equal("Password reset email sent.");
          done();
        });

      });
    });
  })
}
