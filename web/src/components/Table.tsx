import React, { useContext, useEffect, useReducer, useState } from "react";
import { io } from "socket.io-client";
import PlayedCard from "../models/PlayedCard";
import EVENTS from "../socket/events";
import { useSocket } from "../socket/SocketContext";
import { useAppContext } from "./AppContext";
import Button from "./Button";
import Card from "./Card";

interface TableProps {
    playedCards: PlayedCard[];
    deck: number[];
    roomOwner: boolean;
}

const Table: React.FC<TableProps> = ({
    playedCards,
    deck,
    roomOwner,
}: TableProps) => {
    const [isRoomOwner, setRoomOwner] = useState(roomOwner);
    const [cards, setPlayedCards] = useState<PlayedCard[]>(playedCards);
    const [selectedCard, setSelectedCard] = useState("");
    const [isCardFlipped, flipCard] = useReducer(
        (isFlipped) => !isFlipped,
        false
    );
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
        flipCard();
    });

    const selectCard = (e: React.MouseEvent<HTMLElement>) => {
        let button = e.target as HTMLInputElement;

        setSelectedCard(button.id);
        socket.emit(
            EVENTS.CLIENT.SELECTED_CARD,
            roomId,
            userId,
            username,
            button.id
        );

        const updatedCards: PlayedCard[] = cards.map((playedCard) => {
            return playedCard.username === username
                ? {
                      card: button.id,
                      username,
                      userId,
                      story: playedCard.story,
                  }
                : playedCard;
        });

        console.log("Played cards: ", updatedCards);

        setPlayedCards(updatedCards);
    };

    useEffect(() => {
        console.log("Played cards updated", playedCards);
        
        setPlayedCards(playedCards);
    }, [playedCards]);

    useEffect(() => {
        return () => {
            socket.close();
        };
    }, []);

    const handleFlip = () => {
        socket.emit(EVENTS.CLIENT.FLIP_CARDS, roomId);
        flipCard();
    };

    return (
        <div className="flex flex-col justify-between p-8 text-xl w-full">
            {isRoomOwner && (
                <div className="flex justify-center mb-16">
                    <Button
                        onClick={handleFlip}
                        className="h-16 w-72 mt-16 mx-8 rounded-xl p-4 text-xl font-semibold bg-slate-700 shadow-sm shadow-black hover:scale-110 hover:bg-slate-600"
                    >
                        Flip
                    </Button>

                    <Button className="h-16 w-72 mt-16 mx-8 rounded-xl p-4 text-xl font-semibold bg-slate-700 shadow-sm shadow-black hover:scale-110 hover:bg-slate-600">
                        Reset
                    </Button>

                    <Button className="h-16 w-72 mt-16 mx-8 rounded-xl p-4 text-xl font-semibold bg-slate-700 shadow-sm shadow-black hover:scale-110 hover:bg-slate-600">
                        Next
                    </Button>
                </div>
            )}
            <div className="w-full ">
                <div className="flex w-full flex-wrap justify-center">
                    {cards.map((playedCard: PlayedCard, index: number) => {
                        return (
                            <div
                                key={"div_player" + index}
                                className="m-8 mt-8 flex flex-col basis-20 items-center"
                            >
                                <h3 key={"h1_player" + index}>
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
                    })}
                </div>
            </div>

            <div
                key="cards"
                className="flex w-full flex-wrap justify-center align-bottom"
            >
                {deck.map((value: number, index: number) => {
                    return (
                        <div key={"div_cards" + index}>
                            <Card
                                value={value.toString()}
                                flipped={true}
                                id={"card" + index}
                                setSelected={selectCard}
                                isSelected={selectedCard === value.toString()}
                                isDisabled={isCardFlipped}
                            />
                        </div>
                    );
                })}

            </div>
        </div>
    );
};

export default Table;
