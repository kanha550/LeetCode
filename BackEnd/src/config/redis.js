const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-18920.crce206.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 18920
    }
});


module.exports = redisClient;