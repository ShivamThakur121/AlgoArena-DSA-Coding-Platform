const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: 'Vw6oyGRVN01gAg7dFiVrjzkUHlqIfoGL',
    socket: {
        host: 'redis-11873.c89.us-east-1-3.ec2.cloud.redislabs.com',
        port: 11873
    }
});


module.exports = redisClient;