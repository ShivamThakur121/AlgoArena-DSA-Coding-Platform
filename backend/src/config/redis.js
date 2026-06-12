
const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host:  'debonair-auric-spot-33541.db.redis.io',
        port: 14070
    }
});


module.exports = redisClient;
