const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: 'Vw6oyGRVN01gAg7dFiVrjzkUHlqIfoGL',
    socket: {
        host: 'debonair-auric-spot-33541.db.redis.io',
        port: 14070
    }
});

module.exports = redisClient;
