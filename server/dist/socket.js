"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Events_1 = __importDefault(require("./models/Events"));
const rooms = new Map();
const socket = ({ io }) => {
    console.log(`Sockets enabled`);
    let allPlayers = [];
    io.on(Events_1.default.connection, (socket) => {
        console.log(`User connected ${socket.id}`);
        allPlayers.push(socket);
        socket.on(Events_1.default.disconnect, () => {
            console.log("User disconnected: ", socket.id);
            allPlayers = allPlayers.filter((playerSocket) => playerSocket !== socket);
            rooms.forEach((room, value) => {
                console.log(value);
                return room = room.filter((player) => player !== socket.id);
            });
            console.log(rooms);
        });
        socket.on(Events_1.default.CLIENT.CREATE_ROOM, ({ roomId, userId }) => {
            console.log("Socket: create room: ", roomId);
            rooms.set(roomId, [userId]);
            socket.join(roomId);
        });
        socket.on(Events_1.default.CLIENT.SEND_ROOM_MESSAGE, ({ roomId, message, username }) => {
            const date = new Date();
            socket.to(roomId).emit(Events_1.default.SERVER.ROOM_MESSAGE, {
                message,
                username,
                time: `${date.getHours()}:${date.getMinutes()}`,
            });
        });
        socket.on(Events_1.default.CLIENT.JOIN_ROOM, (roomId, userId) => {
            console.log(`User(${userId}) joined room ${roomId}`);
            if (!rooms.has(roomId)) {
                console.log("Room id not found ", roomId);
                socket.emit(Events_1.default.SERVER.ROOM_CLOSED, roomId);
                return;
            }
            let players = rooms.get(roomId);
            players === null || players === void 0 ? void 0 : players.push(userId);
            rooms.set(roomId, players);
            socket.join(roomId);
            socket.emit(Events_1.default.SERVER.JOINED_ROOM, roomId, players);
        });
    });
};
exports.default = socket;
//# sourceMappingURL=socket.js.map