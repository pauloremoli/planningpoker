import { Server, Socket } from "socket.io";
import { ROOM_KEY } from "./constants";
import EVENTS from "./models/Events";
import PlayedCard from "./models/PlayedCard";
import Room from "./models/Room";
import redisClient from "./redis";

type User = {
    socket: Socket;
    username: string;
};

const rooms = new Map<string, string[]>();
let allPlayers: User[] = [];

const socket = ({ io }: { io: Server }) => {
    console.log(`Sockets enabled`);

    io.on(EVENTS.connection, (socket: Socket) => {
        console.log(`User connected ${socket.id}`);
        allPlayers.push({ socket, username: "" });

        io.on("disconnect", () => {
            console.log("user disconnected");
            rooms.forEach((value) => {
                value = value.filter((user) => user !== socket.id);
            });
        });

        /*
         * Create a new room
         */
        socket.on(EVENTS.CLIENT.CREATE_ROOM, ({ roomId, userId }) => {
            console.log("Socket: create room: ", roomId);
            // create a roomId
            // add a new room to the rooms object
            rooms.set(roomId, [userId]);

            socket.join(roomId);
        });

        /*
         * When a user sends a message it's broadcasted to other players in the room
         */

        socket.on(
            EVENTS.CLIENT.SEND_ROOM_MESSAGE,
            (roomId, message, username) => {
                const date = new Date();

                socket.broadcast.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
                    message,
                    username,
                    time: `${date.getHours()}:${date.getMinutes()}`,
                });
            }
        );

        /*
         * When a user joins a room
         */
        socket.on(EVENTS.CLIENT.JOIN_ROOM, (roomId, username) => {
            if (!rooms.has(roomId)) {
                console.log("Room id not found ", roomId);

                socket.broadcast
                    .to(roomId)
                    .emit(EVENTS.SERVER.ROOM_CLOSED, roomId);

                return;
            }
            console.log("EVENTS.CLIENT.JOIN_ROOM", roomId, username);

            allPlayers = allPlayers.map((user: User) => {
                return { socket: user.socket, username };
            });

            socket.join(roomId);

            redisClient.get(ROOM_KEY + roomId).then(async (data) => {
                if (!data) {
                    socket.broadcast
                        .to(roomId)
                        .emit(EVENTS.SERVER.ROOM_CLOSED, roomId);
                    return;
                }

                const roomData: Room = JSON.parse(data);
                roomData.playedCards.push({ player: username, card: "" });

                await redisClient.set(
                    ROOM_KEY + roomId,
                    JSON.stringify(roomData),
                    "ex",
                    1000 * 60 * 60 * 24 * 1
                ); // 1 day

                console.log(roomData);
                socket.emit(EVENTS.SERVER.JOINED_ROOM, roomData);
            });
        });

        /*
         * User selected a card
         */
        socket.on(EVENTS.CLIENT.SELECTED_CARD, async (roomId, userId, card) => {
            console.log(`User ${userId} selected card ${card}`);

            if (!rooms.has(roomId)) {
                console.log("Room id not found ", roomId);

                socket.broadcast
                    .to(roomId)
                    .emit(EVENTS.SERVER.ROOM_CLOSED, roomId);

                return;
            }

            redisClient.get(ROOM_KEY + roomId).then(async (data) => {
                if (!data) {
                    console.error(`Room id (${roomId}) not found`);
                    return;
                }
                const roomData: Room = JSON.parse(data);
                const playedCard: PlayedCard = { player: userId, card };

                roomData.playedCards = roomData.playedCards.filter(
                    (playedCard: PlayedCard) => playedCard.player !== userId
                );
                roomData.playedCards.push(playedCard);

                await redisClient.set(
                    ROOM_KEY + roomId,
                    JSON.stringify(roomData),
                    "ex",
                    1000 * 60 * 60 * 24 * 1
                ); // 1 day

                console.log("socket.broadcast.emit SELECTED_CARD");
                console.log(rooms);
                socket.broadcast
                    .to(roomId)
                    .emit(
                        EVENTS.SERVER.SELECTED_CARD,
                        roomId,
                        roomData.playedCards
                    );
            });
        });

        /*
         * User selected a card
         */
        socket.on(EVENTS.CLIENT.FLIP_CARDS, (roomId, flipped) => {
            console.log(`Cards flipped`, flipped);

            if (!rooms.has(roomId)) {
                console.log("Room id not found ", roomId);

                socket.broadcast.emit(EVENTS.SERVER.ROOM_CLOSED, roomId);

                return;
            }

            redisClient.get(ROOM_KEY + roomId).then(async (data) => {
                if (!data) {
                    console.error(`Room id (${roomId}) not found`);
                    return;
                }
                const roomData: Room = JSON.parse(data);

                roomData.flippedCards = flipped;
                await redisClient.set(
                    ROOM_KEY + roomId,
                    JSON.stringify(roomData),
                    "ex",
                    1000 * 60 * 60 * 24 * 1
                ); // 1 day

                socket.broadcast.emit(EVENTS.SERVER.FLIP_CARDS, roomId);
            });
        });
    });
};

export default socket;
