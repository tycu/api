
// TODO move to long lasting server based access tokens
// https://developers.facebook.com/docs/facebook-login/access-tokens/expiration-and-extension

// const getFacebookUserInfo = function(facebookToken, callback) {
//   const appIdAndSecret = '980119325404337|55224c68bd1df55da4bcac85dc879906';
//   const url = 'https://graph.facebook.com/v2.7/debug_token?access_token=' + appIdAndSecret + '&input_token=' + facebookToken;
//   request.get(url, function(err, res, body) {
//     if (res.statusCode == 200) {
//       if (JSON.parse(body).data.is_valid) {
//         const url = 'https://graph.facebook.com/v2.7/me?fields=id,name,email&access_token=' + facebookToken;
//         request.get(url, function(err, res, body) {
//           if (res.statusCode == 200) {
//             callback(true, JSON.parse(body));
//           } else {
//             callback(false);
//           }
//         });
//         return;
//       }
//     }
//     callback(false);
//   });
// };




// NOTE need to add ssl cert locally
  // http://localhost:5000/api/v1/auth/facebook/deauthorize
  // and add to facebook
  // router.route('/auth/facebook/deauthorize')
  // .post(deauthorizeFacebook, function(req, res, next) {
  //   debug('in POST /auth/facebook/deauthorize');
  //   return res.status(200).json(req.user);
  // })
