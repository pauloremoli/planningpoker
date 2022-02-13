"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanCache = exports.closeServer = exports.redis = exports.io = exports.httpServer = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const constants_1 = require("./constants");
const connect_redis_1 = __importDefault(require("connect-redis"));
const body_parser_1 = __importDefault(require("body-parser"));
require("dotenv/config");
const console_1 = require("console");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const Events_1 = __importDefault(require("./models/Events"));
const APPLICATION_URL = process.env.APPLICATION_URL;
const app = (0, express_1.default)();
exports.httpServer = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(exports.httpServer, {
    cors: {
        origin: [APPLICATION_URL],
        credentials: true,
    },
});
if (!APPLICATION_URL)
    throw (0, console_1.error)("Missing APPLICATION_URL configuration");
app.use((0, cors_1.default)({
    origin: [APPLICATION_URL],
}));
let RedisStore = (0, connect_redis_1.default)(express_session_1.default);
exports.redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || "localhost"
});
var jsonParser = body_parser_1.default.json();
app.use(express_1.default.json());
const redisSecret = process.env.REDIS_SECRET;
if (!redisSecret)
    throw (0, console_1.error)("Missing REDIS_SECRET configuration");
app.use((0, express_session_1.default)({
    name: constants_1.COOKIE_NAME,
    store: new RedisStore({ client: exports.redis, disableTouch: true }),
    cookie: {
        maxAge: 315569520000,
        httpOnly: true,
        secure: constants_1.__prod__,
        sameSite: "lax",
    },
    saveUninitialized: true,
    secret: redisSecret,
    resave: false,
}));
app.get("/health", ({ res }) => res.send("Server up"));
app.get("/", ({ res }) => res.send("Server up"));
app.get("/room/", async (req, res) => {
    console.log("Received request on /room with params: ", req.query);
    if (!req.query.roomId) {
        return res.status(500).send({ error: "Parameter roomId is required" });
    }
    return exports.redis
        .get(constants_1.ROOM_KEY + req.query.roomId)
        .then((response) => {
        const roomParams = response;
        if (!roomParams) {
            return res
                .status(500)
                .send({ error: `Room id (${req.query.roomId}) not found` });
        }
        const data = JSON.parse(roomParams);
        console.log("Returning ", data);
        return res.json(data);
    })
        .catch((error) => {
        console.error(error);
        return res
            .status(500)
            .send({ error: `Could not find room (${req.query.roomId})` });
    });
});
app.post("/createRoom", jsonParser, (req, res) => {
    console.log("Received request on /createRoom with params: ", req.body);
    if (!req.body.deck || req.body.deck.length === 0) {
        return res.status(500).send({ error: "Parameter deck is required" });
    }
    const roomId = (0, uuid_1.v4)();
    const params = req.body;
    const room = {
        roomId,
        deck: params.deck,
        roomOwner: params.roomOwner,
        players: [params.roomOwner],
        stories: [],
        playedCards: [],
    };
    exports.redis.set(constants_1.ROOM_KEY + roomId, JSON.stringify(room), "ex", 1000 * 60 * 60 * 24 * 1);
    return res.json({ roomId });
});
app.post("/addStory", jsonParser, (req, res) => {
    console.log("Received request on /addStory with params: ", req.body);
    if (!req.body.roomId) {
        console.log("Parameter roomId is required");
        return res.status(500).send({ error: "Parameter roomId is required" });
    }
    if (!req.body.story) {
        console.log("Parameter story is required");
        return res.status(500).send({ error: "Parameter story is required" });
    }
    if (!req.body.story.name) {
        console.log("Parameter story.name is required");
        return res
            .status(500)
            .send({ error: "Parameter story.name is required" });
    }
    const roomId = req.body.roomId;
    const story = req.body.story;
    return exports.redis
        .get(constants_1.ROOM_KEY + roomId)
        .then((roomParams) => {
        if (!roomParams) {
            console.log(`Room id (${req.query.roomId}) not found`);
            return res
                .status(500)
                .send({ error: `Room id (${req.query.roomId}) not found` });
        }
        const data = JSON.parse(roomParams);
        data.stories = [...data.stories, story];
        exports.redis.set(constants_1.ROOM_KEY + roomId, JSON.stringify(data), "ex", 1000 * 60 * 60 * 24 * 1);
        exports.io.to(roomId).emit(Events_1.default.SERVER.NEW_STORY, story, roomId);
        return res.json(data);
    })
        .catch((error) => {
        console.error(error);
        return res
            .status(500)
            .send({ error: `Could not find room (${req.query.roomId})` });
    });
});
const closeServer = () => {
    exports.redis.quit();
};
exports.closeServer = closeServer;
const cleanCache = async () => {
    await exports.redis.flushall();
};
exports.cleanCache = cleanCache;
exports.default = app;
//# sourceMappingURL=app.js.map