import connectRedis from "connect-redis";
import { error } from "console";
import cors from "cors";
import "dotenv/config";
import express from "express";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import { COOKIE_NAME, __prod__ } from "./constants";
import redis from "./redis";
import routes from "./routes";

const APPLICATION_URL = process.env.APPLICATION_URL;

const app = express();

export const httpServer = createServer(app);

export const io = new Server(httpServer, {
    cors: {
        origin: [APPLICATION_URL!],
        credentials: true,
    },
});

io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("Invalid username"));
    }
    (socket as any).username = username;
    next();
});

if (!APPLICATION_URL) throw error("Missing APPLICATION_URL configuration");

app.use(
    cors({
        origin: [APPLICATION_URL],
    })
);

let RedisStore = connectRedis(session);

app.use(express.json());

const redisSecret = process.env.REDIS_SECRET;

if (!redisSecret) throw error("Missing REDIS_SECRET configuration");

app.use(
    session({
        name: COOKIE_NAME,
        store: new RedisStore({ client: redis, disableTouch: true }),
        cookie: {
            maxAge: 315569520000, // 10 years
            httpOnly: true,
            secure: __prod__,
            sameSite: "lax",
        },
        saveUninitialized: true,
        secret: redisSecret,
        resave: false,
    })
);

app.use(routes);

export const closeServer = () => {
    redis.quit();
};

export const cleanCache = async () => {
    await redis.flushall();
};

export default app;
