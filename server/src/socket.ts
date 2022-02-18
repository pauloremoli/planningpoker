import { Server } from "socket.io";
import { v4 } from "uuid";
import { ROOM_KEY } from "./constants";
import EVENTS from "./types/Events";
import PlayedCard from "./types/PlayedCard";
import Room from "./types/Room";
import redisClient from "./redis";
import Socket from "./types/Socket";

type Player = {
    socket: Socket;
    userId: string;
};

const rooms = new Map<string, Player[]>();

const addNewPlayerToRoom = async (
    roomId: string,
    socket: Socket,
    userId: string,
    roomData: Room
) => {
    const username = socket.username;

    console.log(
        "Adding new player to room: socketId(",
        socket.id,
        ") username(",
        username,
        "), userId (",
        userId,
        ")"
    );

    let players = rooms.get(roomId) || [];
    players.push({ socket, userId });
    rooms.set(roomId, players);

    roomData.playedCards.push({ username, userId, card: "" });

    await redisClient.set(
        ROOM_KEY + roomData.roomId,
        JSON.stringify(roomData),
        "ex",
        1000 * 60 * 60 * 24 * 1
    ); // 1 day

    socket.emit(EVENTS.SERVER.JOINED_ROOM, roomData, userId);
};

const isPlayerAlreadyInTheRoom = (
    roomId: string,
    socketId: string,
    userId: string
) => {
    let players = rooms.get(roomId) || [];
    const player = players.find(
        (player: Player) =>
            player.userId === userId || player.socket.id === socketId
    );
    return player ? true : false;
};

const updatePlayerInfo = (roomId: string, userId: string, socket: Socket) => {
    console.log(
        "Player is already in the room, udpating player info",
        socket.username
    );
    const username = socket.username;
    let players = rooms.get(roomId) || [];
    players = players.map((user: Player) => {
        return userId === user.userId ? { socket, userId, username } : user;
    });

    rooms.set(roomId, players);

    console.log("Update room", rooms.get(roomId));
};


const socket = ({ io }: { io: Server }) => {
    console.log(`Sockets enabled`);

    io.on(EVENTS.connection, (socket: Socket) => {
        io.on("disconnect", () => {
            console.log("user disconnected", socket.id);
            rooms.forEach((players) => {
                players = players.filter(
                    (player: Player) => player.socket.id !== socket.id
                );
            });

            console.log("Rooms", rooms);
        });

        /*
         * When a user sends a message it's broadcasted to other players in the room
         */

        socket.on(EVENTS.CLIENT.SEND_ROOM_MESSAGE, (roomId, message) => {
            const date = new Date();

            socket.broadcast.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
                message,
                username: socket.username,
                time: `${date.getHours()}:${date.getMinutes()}`,
            });
        });

        /*
         * When a user joins a room
         */
        socket.on(EVENTS.CLIENT.JOIN_ROOM, (roomId, userId) => {
            console.log("EVENTS.CLIENT.JOIN_ROOM", roomId, socket.username);

            redisClient.get(ROOM_KEY + roomId).then(async (data) => {
                if (!data) {
                    socket.broadcast
                        .to(roomId)
                        .emit(EVENTS.SERVER.ROOM_CLOSED, roomId);
                    return;
                }

                socket.join(roomId);
                const roomData: Room = JSON.parse(data);

                if (!userId) {
                    userId = v4();
                    console.log("New userId generated:", userId);
                }

                if (isPlayerAlreadyInTheRoom(roomId, socket.id, userId)) {
                    updatePlayerInfo(roomId, userId, socket);
                } else {
                    addNewPlayerToRoom(roomId, socket, userId, roomData);
                }

                console.log(EVENTS.SERVER.JOINED_ROOM, userId);
                socket.broadcast
                    .to(roomId)
                    .emit(EVENTS.SERVER.PLAYER_JOINED_ROOM, roomData, userId);
                console.log("Rooms:", rooms);
            });
        });

        /*
         * User selected a card
         */
        socket.on(
            EVENTS.CLIENT.SELECTED_CARD,
            async (roomId, userId, username, card) => {
                console.log(`User ${username} selected card ${card}`);

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
                    const playedCard: PlayedCard = { userId, username, card };

                    roomData.playedCards = roomData.playedCards.filter(
                        (playedCard: PlayedCard) =>
                            playedCard.username !== username
                    );
                    roomData.playedCards.push(playedCard);

                    await redisClient.set(
                        ROOM_KEY + roomId,
                        JSON.stringify(roomData),
                        "ex",
                        1000 * 60 * 60 * 24 * 1
                    ); // 1 day

                    console.log("socket.broadcast.emit SELECTED_CARD");
                    console.log(roomData.playedCards);
                    socket.broadcast
                        .to(roomId)
                        .emit(
                            EVENTS.SERVER.SELECTED_CARD,
                            roomData.playedCards
                        );
                });
            }
        );

        /*
         * User selected a card
         */
        socket.on(EVENTS.CLIENT.FLIP_CARDS, (roomId) => {
            console.log(`Cards flipped`, roomId);

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

                roomData.flippedCards = true;
                await redisClient.set(
                    ROOM_KEY + roomId,
                    JSON.stringify(roomData),
                    "ex",
                    1000 * 60 * 60 * 24 * 1
                ); // 1 day

                console.log(EVENTS.SERVER.FLIP_CARDS, roomId);

                
                socket.broadcast
                    .to(roomId)
                    .emit(EVENTS.SERVER.FLIP_CARDS, roomId);
            });
        });
    });
};

export default socket;
