
### Command line access to production Redis database

`redis-cli -h pub-redis-12675.us-east-1-4.3.ec2.garantiadata.com -p 12675 -a 35CTGBTHuclyEFNu`

### Curl Requests for auth
sign up with this request
`curl -v -d "email=rmf34@cornell.edu&password=demo"  http://127.0.0.1:5000/api/v1/signup`

verify signed-in with this request
`curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDksImVtYWlsIjoicm1mMzIyMjEwQGNvcm5lbGwuZWR1IiwiaWF0IjoxNDcwMTc5MzkzLCJleHAiOjE0NzAxOTczOTN9.nBW8IIbJBwCuXGDwG56r7DTJY9pQvNljTXnUsKF3J2c" -v  http://127.0.0.1:5000/api/v1/verify`

sign out with this request
`curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDgsImVtYWlsIjoicm1mMzIyMjEyQGNvcm5lbGwuZWR1IiwiaWF0IjoxNDcwMTY0MD7ySj21hoaKuzx_afQ2c" -v  http://127.0.0.1:5000/api/v1/signout`

sign in with this request
`curl -v -d "email=rmf34@cornell.edu&password=done"  http://127.0.0.1:5000/api/v1/sigin`