import { Server } from "socket.io";
import { v4 } from "uuid";
import { ROOM_KEY } from "./constants";
import redisClient from "./redis";
import EVENTS from "./types/Events";
import PlayedCard from "./types/PlayedCard";
import TRoom from "./types/TRoom";
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
	roomData: TRoom
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
};

export const calculateStatistics = (playedCards: PlayedCard[]) => {
	let count = 0;
	let min: PlayedCard[] = [];
	let max: PlayedCard[] = [];
	let total = 0;

	playedCards.map((currentValue) => {
		if (currentValue.card && currentValue.card !== "?") {
			count++;

			if (min.length === 0 || min[0].card === currentValue.card) {
				min.push(currentValue);
			} else if (currentValue.card < min[0].card) {
				min = [currentValue];
			}

			if (max.length === 0 || max[0].card === currentValue.card) {
				max.push(currentValue);
			} else if (currentValue.card > max[0].card) {
				max = [currentValue];
			}

			console.log("Max", max);

			console.log("Min", min);

			total += parseFloat(currentValue.card);
		}
	}, 0);

	const average = total / count;

	console.log("min:", min);
	console.log("max:", max);
	console.log("average:", average);

	return { min, max, average };
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
					io.to(roomId).emit(EVENTS.SERVER.ROOM_CLOSED, roomId);
					return;
				}

				console.log("USER_ID", userId);

				socket.join(roomId);
				const roomData: TRoom = JSON.parse(data);

				if (!userId) {
					userId = v4();
					console.log("New userId generated:", userId);
				}

				if (isPlayerAlreadyInTheRoom(roomId, socket.id, userId)) {
					updatePlayerInfo(roomId, userId, socket);
				} else {
					addNewPlayerToRoom(roomId, socket, userId, roomData);
				}

				socket.emit(EVENTS.SERVER.JOINED_ROOM, roomData, userId);
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

					io.to(roomId).emit(EVENTS.SERVER.ROOM_CLOSED, roomId);

					return;
				}

				redisClient.get(ROOM_KEY + roomId).then(async (data) => {
					if (!data) {
						console.error(`Room id (${roomId}) not found`);
						io.to(roomId).emit(EVENTS.SERVER.ROOM_CLOSED, roomId);
						return;
					}
					const roomData: TRoom = JSON.parse(data);
					const playedCard: PlayedCard = { userId, username, card };

					roomData.playedCards = roomData.playedCards.filter(
						(playedCard: PlayedCard) => playedCard.userId !== userId
					);
					roomData.playedCards.push(playedCard);

					await redisClient.set(
						ROOM_KEY + roomId,
						JSON.stringify(roomData),
						"ex",
						1000 * 60 * 60 * 24 * 1
					); // 1 day

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

				io.to(roomId).emit(EVENTS.SERVER.ROOM_CLOSED, roomId);

				return;
			}

			redisClient.get(ROOM_KEY + roomId).then(async (data) => {
				if (!data) {
					console.error(`Room id (${roomId}) not found`);
					socket.broadcast.emit(EVENTS.SERVER.ROOM_CLOSED, roomId);
					return;
				}
				const roomData: TRoom = JSON.parse(data);

				roomData.flippedCards = true;
				await redisClient.set(
					ROOM_KEY + roomId,
					JSON.stringify(roomData),
					"ex",
					1000 * 60 * 60 * 24 * 1
				); // 1 day

				console.log(EVENTS.SERVER.FLIP_CARDS, roomId);

				const { min, max, average } = calculateStatistics(
					roomData.playedCards
				);

				io.in(roomId).emit(EVENTS.SERVER.FLIP_CARDS, average, min, max);
			});
		});

		/*
		 * Reset cards
		 */
		socket.on(EVENTS.CLIENT.RESET_CARDS, (roomId) => {
			console.log(`Cards reseted`, roomId);

			if (!rooms.has(roomId)) {
				console.log("Room id not found ", roomId);

				io.to(roomId).emit(EVENTS.SERVER.ROOM_CLOSED, roomId);

				return;
			}

			redisClient.get(ROOM_KEY + roomId).then(async (data) => {
				if (!data) {
					console.error(`Room id (${roomId}) not found`);
					socket.broadcast.emit(EVENTS.SERVER.ROOM_CLOSED, roomId);
					return;
				}
				const roomData: TRoom = JSON.parse(data);

				roomData.playedCards = roomData.playedCards.map(
					(playedCard) => {
						playedCard.card = "";
						return playedCard;
					}
				);

				await redisClient.set(
					ROOM_KEY + roomId,
					JSON.stringify(roomData),
					"ex",
					1000 * 60 * 60 * 24 * 1
				); // 1 day

				console.log(EVENTS.SERVER.RESET_CARDS, roomId);

				socket.broadcast.to(roomId).emit(EVENTS.SERVER.RESET_CARDS);
			});
		});

		/*
		 * Next story
		 */
		socket.on(EVENTS.CLIENT.NEXT_STORY, (roomId) => {
			console.log(`Next story`, roomId);

			if (!rooms.has(roomId)) {
				console.log("Room id not found ", roomId);

				socket.broadcast.emit(EVENTS.SERVER.ROOM_CLOSED, roomId);

				return;
			}

			redisClient.get(ROOM_KEY + roomId).then(async (data) => {
				if (!data) {
					console.error(`Room id (${roomId}) not found`);
					socket.broadcast.emit(EVENTS.SERVER.ROOM_CLOSED, roomId);
					return;
				}
				const roomData: TRoom = JSON.parse(data);

				await redisClient.set(
					ROOM_KEY + roomId,
					JSON.stringify(roomData),
					"ex",
					1000 * 60 * 60 * 24 * 1
				); // 1 day

				console.log(EVENTS.SERVER.NEXT_STORY, roomId);

				io.to(roomId).emit(EVENTS.SERVER.NEXT_STORY, roomId);
			});
		});
	});
};

export default socket;
