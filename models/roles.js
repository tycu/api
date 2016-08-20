var allRoles;

var publicRole = {
  name: 'public',
  resources: [
    '/api/v1/events'
  ],
  permissions: ['get']
};
allRoles.push(publicRole);

var adminRole = {
  name: 'admin',
  resources: [
    '/books',
    '/books/:param1',
    '/books/:param1/pages',
    '/books/:param1/pages/:pageId'
  ],
  permissions: '*'
};
allRoles.push(adminRole);

var userRole = {
  name: 'user',
  resources: [
    '/books',
  ],
  permissions: ['get', 'post']
};
allRoles.push(userRole);
