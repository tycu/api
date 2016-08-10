### Required
[Homebrew](http://brew.sh/)
xcode command line tools, install via app store

### Suggested tools
[iTerm 2](https://www.iterm2.com/)
[sublime text 3](https://www.sublimetext.com/3)
[postico postgresql db gui](https://eggerapps.at/ postico/)
[postgres mac app](http://postgresapp.com/)


#### NVM Setup
make sure you have [Node version manager](https://github.com/creationix/nvm) installed (requires OSX command lines tools). make sure to do this from your base directory `$ cd ~`:

`$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.4/install.sh | bash`

then load NVM
`$ export NVM_DIR="$HOME/.nvm" [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"`

if this doesn't work read the part about .bash_profle setup on the NVM github readme

verify installation:
`$ command -v nvm`
this should output 'nvm' if the installation was successful

use correct node version (5.7) there is an .nvmrc file specifying this

`$ nvm use` should use 5.7
if not found:
`$ nvm install` will install 5.7

then cd to the appropriate tally repo

[to read more about setup/version installation if necessary](https://github.com/creationix/nvm#usage)

### Within Tally API  Repo

get latest packages:
`$ npm install`

remove unncessary stuff:
`$ npm prune`

start redis:
`$ redis-server`
start redis monitoring if desired:
`$ redis-cli monitor`

if you do not have redis installed:
`$ brew install redis`

start api server with dev logging:
`$ npm run start`

start api server without logging:
`$ node main.js`

If there are errors, make note of them, troubleshoot, need to fix.

### DB and migrations

We are using Sequelize as an ORM to talk to postgres. Need to have postgres running locally.

If it is your first time starting or you've dropped the 'tally_development' database, you will need to run:
`$ npm run createDb`

to run ALL (currently unrun) migrations alone:
`$ sequelize db:migrate`

*if this fails you may have to run it with:*
`$ node_modules/.bin/sequelize`

you can of course alias this in .bash_profile by adding this line:
`alias sequelize='node_modules/.bin/sequelize'`

to drop ALL tables:
`$ db:migrate:undo:all`

to seed single model (need to replace with the specific seeded you want to use)
`$ sequelize db:seed --seed seeders/20160726221416-event-tweet-seeder.js`

to seed ALL models:
`$ sequelize db:seed:all`

to run ALL migrations and seed ALL tables at the same time:
`$ npm run migrate`

to create a new model/migration file:
`$ sequelize model:create --name Contribution --attributes id:integer,user_id:integer,charge_id:integer,amount:string,event_id:integer,pac_id:integer,support:boolean`


### Command line access to production Redis database

`redis-cli -h pub-redis-12675.us-east-1-4.3.ec2.garantiadata.com -p 12675 -a 35CTGBTHuclyEFNu`

### Curl Requests for auth
*note that tokens will need to change based on what is in redis*
sign up with this request:
`curl -v -d "email=rmf34@cornell.edu&password=demo"  http://127.0.0.1:5000/api/v1/signup`

verify signed-in with this request:
`curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDksImVtYWlsIjoicm1mMzIyMjEwQGNvcm5lbGwuZWR1IiwiaWF0IjoxNDcwMTc5MzkzLCJleHAiOjE0NzAxOTczOTN9.nBW8IIbJBwCuXGDwG56r7DTJY9pQvNljTXnUsKF3J2c" -v  http://127.0.0.1:5000/api/v1/verify`

sign out with this request:
`curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDgsImVtYWlsIjoicm1mMzIyMjEyQGNvcm5lbGwuZWR1IiwiaWF0IjoxNDcwMTY0MD7ySj21hoaKuzx_afQ2c" -v  http://127.0.0.1:5000/api/v1/signout`

sign in with this request:
`curl -v -d "email=rmf34@cornell.edu&password=demo"  http://127.0.0.1:5000/api/v1/sigin`
