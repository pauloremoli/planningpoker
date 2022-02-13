import Redis from "ioredis";

const redisClient = new Redis({
    host: process.env.REDIS_HOST || "localhost",
});

export default redisClient;