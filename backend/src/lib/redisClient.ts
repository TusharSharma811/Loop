import redis from 'redis';
import logger from '../utils/logger.js';

const redisPort = parseInt(process.env.REDIS_PORT || '17312', 10);

const publisher = redis.createClient({
        username: 'default',
        password: process.env.REDIS_PASSWORD as string,
        socket: {
                host: process.env.REDIS_URL,
                port: redisPort
        }
});

const subscriber = redis.createClient({
        username: 'default',
        password: process.env.REDIS_PASSWORD as string,
        socket: {
                host: process.env.REDIS_URL,
                port: redisPort
        }
});

// Add error handling for Redis connections
publisher.on('error', (err) => {
        logger.error('Redis Publisher Error:', err);
});

publisher.on('connect', () => {
        logger.info('Redis Publisher connected');
});

subscriber.on('error', (err) => {
        logger.error('Redis Subscriber Error:', err);
});

subscriber.on('connect', () => {
        logger.info('Redis Subscriber connected');
});

export { publisher, subscriber };