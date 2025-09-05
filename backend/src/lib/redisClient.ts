import redis from 'redis';

const publisher = redis.createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD as string,
    socket: {
        host: process.env.REDIS_URL,
        port: 17312
    }
});

const subscriber = redis.createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD as string,
    socket: {
        host: process.env.REDIS_URL,
        port: 17312
    }
});

// Add error handling for Redis connections
publisher.on('error', (err) => {
    console.error('Redis Publisher Error:', err);
});

publisher.on('connect', () => {
    console.log('Redis Publisher connected');
});

subscriber.on('error', (err) => {
    console.error('Redis Subscriber Error:', err);
});

subscriber.on('connect', () => {
    console.log('Redis Subscriber connected');
});

export { publisher, subscriber };