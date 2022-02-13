import React, { useEffect, useState } from "react";
import EVENTS from "../socket/events";
import { useSocket } from "../socket/SocketContext";
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
    const [connectedPlayers, setPlayers] = useState<string[]>(players);
    const [selectedCard, setSelectedCard] = useState("");
    const { socket } = useSocket();

    socket.on(
        EVENTS.SERVER.JOINED_ROOM,
        (roomId: string, players: string[]) => {
            setPlayers(players);
            console.log(players);
        }
    );

    const selectCard = (e: React.MouseEvent<HTMLElement>) => {
        let button = e.target as HTMLInputElement;
        setSelectedCard(button.id);
    };

    useEffect(() => {
        setRoomOwner(roomOwner);
    }, [roomOwner]);

    useEffect(() => {
        console.log(players);

        setPlayers(players);
    }, [players]);

    return (
        <div className="flex flex-col justify-between p-8 text-xl w-full">
            {isRoomOwner && (
                <div className="flex justify-center mb-16">
                    <Button className="h-16 w-72 mt-16 mx-8 rounded-xl p-4 text-xl font-semibold bg-slate-700 shadow-sm shadow-black hover:scale-110 hover:bg-slate-600">
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
                    {connectedPlayers.map((player: string, index: number) => {
                        return (
                            <div
                                key={"div_player" + index}
                                className="m-8 mt-8 flex flex-col basis-20 items-center"
                            >
                                <h3 key={"h1_player" + index}>{player}</h3>
                                <Card
                                    value={null}
                                    flipped={false}
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
