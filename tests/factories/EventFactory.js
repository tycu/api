var factory = require('factory-girl');
var Event   = require('../../models/event');

// NOTE first attempt to set up factory
// Just going to seed TEST db for now/faster.

console.log('before event factory');
factory.define('event', Event, {
  // id: ,
  isPinned: false,
  isPublished: true,
  imageUrl: 'http://imageurl.com',
  imageAttribution: 'NYT',
  politicianId: 1,
  headline: 'new headline here',
  // headline: factory.seq(function(n) {
  //   return 'Headline' + n + 'For Tally US';
  // }),
  summary: 'Summary here',
  deletedAt: null,
  createdAt:  Date.now() / 1000,
  updatedAt:  Date.now() / 1000
});

factory.build('event', function(err, event) {
  console.log(event.attributes);
});
