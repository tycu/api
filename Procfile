# https://blog.heroku.com/node-habits-2016


web: DEBUG=* node main.js
redis: redis-server /usr/local/etc/redis.conf # http://download.redis.io/redis-stable/redis.conf

# worker: bin/worker # NOTE, we're using throng instead of fork
## web: node --optimize_for_size --max_old_space_size=920 --gc_interval=100 server.js
## web: node --optimize_for_size --max_old_space_size=460 --gc_interval=100 server.js  # example for 512mb container

