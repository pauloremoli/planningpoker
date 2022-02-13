import { Server, Socket } from "socket.io";
import EVENTS from "./models/Events";

const rooms = new Map<string, string[]>();

const socket = ({ io }: { io: Server }) => {
    console.log(`Sockets enabled`);

    let allPlayers: Socket[] = [];
    io.on(EVENTS.connection, (socket: Socket) => {
        console.log(`User connected ${socket.id}`);
        allPlayers.push(socket);

        socket.on(EVENTS.disconnect, () => {
            console.log("User disconnected: " , socket.id);
            
            allPlayers = allPlayers.filter(
                (playerSocket) => playerSocket !== socket
            );
            rooms.forEach((room, value) => {
                console.log(value);
                
                
                return room = room.filter((player) => player !== socket.id);
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

            socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId, players);
        });
    });
};

export default socket;
