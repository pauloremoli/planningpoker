import bodyParser from "body-parser";
import express, { Router } from "express";
import { v4 } from "uuid";
import { io } from "./app";
import { ROOM_KEY } from "./constants";
import redis from "./redis";
import EVENTS from "./types/Events";
import Room from "./types/Room";

const app = (module.exports = express());
const routes = Router();

var jsonParser = bodyParser.json();

app.get("/health", ({ res }) => res!.send("Server up"));

app.get("/", ({ res }) => res!.send("Server up"));

app.get("/room/", async (req, res) => {
    console.log("Received request on /room with params: ", req.query);
    if (!req.query.roomId) {
        return res.status(500).send({ error: "Parameter roomId is required" });
    }

    return redis
        .get(ROOM_KEY + req.query.roomId)
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
        .catch((error: any) => {
            console.error(error);
            return res
                .status(500)
                .send({ error: `Could not find room (${req.query.roomId})` });
        });
});

app.post("/createRoom", jsonParser, async (req, res) => {
    console.log("Received request on /createRoom with params: ", req.body);

    if (!req.body.deck || req.body.deck.length === 0) {
        return res.status(500).send({ error: "Parameter deck is required" });
    }

    const roomId = v4();
    const params = req.body;

    let userId = params.userId;
    if (!userId) {
        userId = v4();
    }

    const room: Room = {
        roomId,
        deck: params.deck,
        roomOwner: userId,
        flippedCards: false,
        votedStories: [],
        nextStories: [],
        playedCards: [],
        currentStory: undefined,
    };

    await redis.set(
        ROOM_KEY + roomId,
        JSON.stringify(room),
        "ex",
        1000 * 60 * 60 * 24 * 1
    ); // 1 day

    return res.json({ roomId, userId });
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

    return redis
        .get(ROOM_KEY + roomId)
        .then((roomParams) => {
            if (!roomParams) {
                console.log(`Room id (${req.query.roomId}) not found`);

                return res
                    .status(500)
                    .send({ error: `Room id (${req.query.roomId}) not found` });
            }
            const data: Room = JSON.parse(roomParams);

            if (!data.currentStory) {
                data.currentStory = story;
            } else {
                data.nextStories = data.nextStories
                    ? [...data.nextStories, story]
                    : [story];
            }

            redis.set(
                ROOM_KEY + roomId,
                JSON.stringify(data),
                "ex",
                1000 * 60 * 60 * 24 * 1
            ); // 1 day

            io.to(roomId).emit(EVENTS.SERVER.NEW_STORY, data);

            return res.json(data);
        })
        .catch((error) => {
            console.error(error);
            return res
                .status(500)
                .send({ error: `Could not find room (${req.query.roomId})` });
        });
});

export default routes;
