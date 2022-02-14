import React, { useContext, useEffect, useReducer, useState } from "react";
import PlayedCard from "../models/PlayedCard";
import EVENTS from "../socket/events";
import { useSocket } from "../socket/SocketContext";
import { useAppContext } from "./AppContext";
import Button from "./Button";
import Card from "./Card";

interface TableProps {
    players: string[];
    deck: number[];
    roomOwner: boolean;
}

const Table: React.FC<TableProps> = ({
    players,
    deck,
    roomOwner,
}: TableProps) => {
    const [isRoomOwner, setRoomOwner] = useState(false);
    const [playedCards, setPlayedCards] = useState<PlayedCard[]>([]);
    const [selectedCard, setSelectedCard] = useState("");
    const [isCardFlipped, flipCard] = useReducer((isFlipped) => !isFlipped, false);
    const { socket } = useSocket();
    const { roomId } = useAppContext();

    socket.on(EVENTS.SERVER.JOINED_ROOM, (room: string, player: string) => {
        if (room === roomId) {
            console.log("New player joined: ", player);
            setPlayedCards([...playedCards, { player, card: "" }]);
        }
    });

    socket.on(
        EVENTS.SERVER.SELECTED_CARD,
        (room: string, playedCards: PlayedCard[]) => {
            if (roomId === room) {
                console.log(playedCards);

                setPlayedCards(playedCards);
            }
        }
    );

    const selectCard = (e: React.MouseEvent<HTMLElement>) => {
        let button = e.target as HTMLInputElement;
        setSelectedCard(button.id);

        socket.emit(EVENTS.CLIENT.SELECTED_CARD, roomId, socket.id, button.id);
    };

    useEffect(() => {
        setRoomOwner(roomOwner);
    }, [roomOwner]);

    useEffect(() => {
        const cards = players.map((p) => {
            return { player: p, card: "" };
        });

        setPlayedCards(cards);
    }, [players]);

    const handleFlip = () => {
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
                    {playedCards.map(
                        (playedCard: PlayedCard, index: number) => {
                            return (
                                <div
                                    key={"div_player" + index}
                                    className="m-8 mt-8 flex flex-col basis-20 items-center"
                                >
                                    <h3 key={"h1_player" + index}>
                                        {playedCard.player}
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
                            />
                        </div>
                    );
                })}

                <Card
                    value={"?"}
                    flipped={true}
                    id={"card_any"}
                    setSelected={selectCard}
                    isSelected={selectedCard === "?"}
                />
            </div>
        </div>
    );
};

export default Table;
