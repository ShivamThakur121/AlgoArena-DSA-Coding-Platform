
const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: 'Vw6oyGRVN01gAg7dFiVrjzkUHlqIfoGL',
    socket: {
<<<<<<< HEAD
        host:  'debonair-auric-spot-33541.db.redis.io',
        port: 14070
=======
        host: 'redis-11873.c89.us-east-1-3.ec2.cloud.redislabs.com',
        port: 11873
>>>>>>> 3f69999 (Updated project files)
    }
});


module.exports = redisClient;
