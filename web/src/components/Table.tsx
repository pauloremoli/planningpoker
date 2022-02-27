import React, { useEffect, useReducer, useState } from "react";
import PlayedCard from "../models/PlayedCard";
import EVENTS from "../socket/events";
import { useSocket } from "../socket/SocketContext";
import { useAppContext } from "./AppContext";
import Button from "./Button";
import Card from "./Card";

interface TableProps {
	cards: PlayedCard[];
	deck: string[];
	roomOwner: boolean;
	nextStory?: () => void;
}

const Table: React.FC<TableProps> = ({
	cards,
	deck,
	roomOwner,
	nextStory = () => {},
}: TableProps) => {
	const [isRoomOwner, setRoomOwner] = useState(roomOwner);
	const [playedCards, setPlayedCards] = useState<PlayedCard[]>(cards);
	const [selectedCard, setSelectedCard] = useState("");
	const [isCardFlipped, setFlippedCard] = useState(false);
	const { socket } = useSocket();
	const { roomId, username, userId } = useAppContext();

	useEffect(() => {
		setRoomOwner(roomOwner);
	}, [roomOwner]);

	socket.on(EVENTS.SERVER.SELECTED_CARD, (playedCards: PlayedCard[]) => {
		console.log("SELECTED_CARD", playedCards);
		setPlayedCards(playedCards);
	});

	socket.on(EVENTS.SERVER.FLIP_CARDS, (room: string) => {
		setFlippedCard(!isCardFlipped);
	});

	socket.on(EVENTS.SERVER.RESET_CARDS, () => {
		resetCards();
	});

	const selectCard = (e: React.MouseEvent<HTMLElement>) => {
		let button = e.target as HTMLInputElement;

		console.log("selectedCard", selectedCard, "clicked", button.id);
		let clickedCard = button.id;

		if (selectedCard === button.id) {
			clickedCard = "";
		}

		setSelectedCard(clickedCard);
	};

	useEffect(() => {
		console.log("Played cards updated", playedCards);

		setPlayedCards(cards);
	}, [cards]);

	useEffect(() => {
		console.log("New card selected: ", selectedCard);

		socket.emit(
			EVENTS.CLIENT.SELECTED_CARD,
			roomId,
			userId,
			username,
			selectedCard
		);

		const updatedCards: PlayedCard[] = playedCards.map((playedCard) => {
			return playedCard.userId === userId
				? {
						card: selectedCard,
						username,
						userId,
						story: playedCard.story,
				  }
				: playedCard;
		});

		console.log("Played cards: ", updatedCards, selectedCard);

		setPlayedCards(updatedCards);
	}, [selectedCard]);

	useEffect(() => {
		return () => {
			socket.close();
		};
	}, []);

	const clearPlayedCards = () => {
		const clearedCards = playedCards.map((playedCard) => {
			playedCard.card = "";
			return playedCard;
		});

		setPlayedCards(clearedCards);
	};

	const resetCards = () => {
		if (isCardFlipped) {
			console.log("isCardFlipped", isCardFlipped);
			setFlippedCard(!isCardFlipped);
		}
		clearPlayedCards();
	};

	const handleFlip = () => {
		socket.emit(EVENTS.CLIENT.FLIP_CARDS, roomId);
		setFlippedCard(!isCardFlipped);
	};

	const handleReset = () => {
		socket.emit(EVENTS.CLIENT.RESET_CARDS, roomId);
		resetCards();
	};

	const handleNext = () => {
		socket.emit(EVENTS.CLIENT.NEXT_STORY, roomId);
	};

	return (
		<div className="flex flex-col p-8 text-xl w-full">
			{isRoomOwner && (
				<div className="flex justify-center mb-16">
					<Button
						onClick={handleFlip}
						disabled={isCardFlipped}
						className="h-16 w-72 mt-16 mx-8 rounded-xl p-4 text-xl font-semibold bg-slate-700 shadow-sm shadow-black hover:scale-110 hover:bg-slate-600"
					>
						Flip
					</Button>

					<Button
						className="h-16 w-72 mt-16 mx-8 rounded-xl p-4 text-xl font-semibold bg-slate-700 shadow-sm shadow-black hover:scale-110 hover:bg-slate-600"
						onClick={handleReset}
					>
						Reset
					</Button>

					<Button
						className="h-16 w-72 mt-16 mx-8 rounded-xl p-4 text-xl font-semibold bg-slate-700 shadow-sm shadow-black hover:scale-110 hover:bg-slate-600"
						onClick={handleNext}
					>
						Next
					</Button>
				</div>
			)}
			<div className="w-full">
				<div className="flex w-full flex-wrap justify-center">
					{playedCards.map(
						(playedCard: PlayedCard, index: number) => {
							return (
								<div
									key={"div_player" + index}
									className="m-8 mt-8 flex flex-col basis-20 items-center"
								>
									<h3
										key={"h1_player" + index}
										className="justify-center"
									>
										{playedCard.username}
									</h3>
									<Card
										value={playedCard.card}
										flipped={isCardFlipped}
										id={"player" + index}
										setSelected={(card: string) => {}}
										isSelected={false}
										selectionEnabled={false}
									/>
								</div>
							);
						}
					)}
				</div>
			</div>

			<div
				key="cards"
				className="flex w-full flex-wrap justify-center mt-auto"
			>
				{deck.map((value: string, index: number) => {
					const isSelected = selectedCard == value;
					console.log(`${value} ${selectedCard} ${isSelected}`);

					return (
						<div key={"div_cards" + index}>
							<Card
								value={value}
								flipped={true}
								id={"card" + index}
								setSelected={selectCard}
								isSelected={isSelected}
								isDisabled={isCardFlipped}
								selectionEnabled={true}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Table;
