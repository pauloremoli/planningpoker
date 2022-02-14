import { Server, Socket } from "socket.io";
import { ROOM_KEY } from "./constants";
import EVENTS from "./models/Events";
import PlayedCard from "./models/PlayedCard";
import Room from "./models/Room";
import redisClient from "./redis";

const rooms = new Map<string, string[]>();

const socket = ({ io }: { io: Server }) => {
    console.log(`Sockets enabled`);

    let allPlayers: Socket[] = [];

    io.on(EVENTS.connection, (socket: Socket) => {
        console.log(`User connected ${socket.id}`);
        allPlayers.push(socket);

        socket.on(EVENTS.disconnect, () => {
            console.log("User disconnected: ", socket.id);

            allPlayers = allPlayers.filter(
                (playerSocket) => playerSocket !== socket
            );
            rooms.forEach((room, value) => {
                console.log(value);

                return (room = room.filter((player) => player !== socket.id));
            });
            console.log(rooms);
        });

        /*disconnect
         * When a user creates a new room
         */
        socket.on(EVENTS.CLIENT.CREATE_ROOM, ({ roomId, userId }) => {
            console.log("Socket: create room: ", roomId);
            // create a roomId
            // add a new room to the rooms object
            rooms.set(roomId, [userId]);

            socket.join(roomId);
        });

        /*
         * When a user sends a room messageroomId broadcast it to other players in the room
         */

        socket.on(
            EVENTS.CLIENT.SEND_ROOM_MESSAGE,
            ({ roomId, message, username }) => {
                const date = new Date();

                socket.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
                    message,
                    username,
                    time: `${date.getHours()}:${date.getMinutes()}`,
                });
            }
        );

        /*
         * When a user joins a room
         */
        socket.on(EVENTS.CLIENT.JOIN_ROOM, (roomId, userId) => {
            console.log(`User(${userId}) joined room ${roomId}`);

            if (!rooms.has(roomId)) {
                console.log("Room id not found ", roomId);

                socket.emit(EVENTS.SERVER.ROOM_CLOSED, roomId);

                return;
            }

            let players = rooms.get(roomId);
            players?.push(userId);

            rooms.set(roomId, players!);

            socket.join(roomId);

            socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId, userId);
        });

        /*
         * User selected a card
         */
        socket.on(EVENTS.CLIENT.SELECTED_CARD, async (roomId, userId, card) => {
            console.log(`User ${userId} selected card ${card}`);

            if (!rooms.has(roomId)) {
                console.log("Room id not found ", roomId);

                socket.emit(EVENTS.SERVER.ROOM_CLOSED, roomId);

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

                socket.emit(
                    EVENTS.SERVER.SELECTED_CARD,
                    roomId,
                    roomData.playedCards
                );
            });
        });
    });
};

export default socket;
