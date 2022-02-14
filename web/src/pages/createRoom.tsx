import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "../api/api";
import { useAppContext } from "../components/AppContext";
import Button from "../components/Button";
import useInput from "../hooks/useInput";
import EVENTS from "../socket/events";
import { useSocket } from "../socket/SocketContext";

export type RoomData = {
    roomId: string;
};

const CreateRoom: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [showCustomValue, setShowCustomValue] = useState(false);
    const [customValueError, setCustomValueError] = useState("");
    const [deck, setDeck] = useState("hours");
    const customValue = useInput("0, 1, 2, 4, 8, 16, 32, 64");
    const [hasError, setError] = useState("");
    let navigate = useNavigate();
    const {setRoomId, roomId} = useAppContext();
    const { socket } = useSocket();


    const handleChangeDeck = (event: any) => {
        if (event.target.value === "custom") {
            setShowCustomValue(true);
        } else {
            setShowCustomValue(false);
        }
        setDeck(event.target.value);
    };

    const getDeckCards = () => {
        if (deck === "custom") {
            const valuesStr = customValue.value.replaceAll(" ", "").split(",");
            const customValueParsed = valuesStr.map((val: string) => {
                try {
                    return parseInt(val);
                } catch (err) {
                    setCustomValueError(
                        "Invalid custom value, only numeric values are allowed, found: " +
                            val
                    );
                    return [];
                }
            });
            console.log(customValueParsed);

            return customValueParsed;
        } else if (deck === "fibonacci") {
            return [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
        } else if (deck === "hours") {
            return [0.5, 1, 2, 4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 72, 80];
        } else if (deck === "powerof2") {
            return [0, 1, 2, 4, 8, 16, 32, 64];
        }
    };

    const createNewRoom = async () => {
        setLoading(true);
        const params = { deck: getDeckCards(), roomOwner: socket.id };

        post<RoomData>("/createRoom", params)
            .then((data) => {
                const roomId = data.roomId;
                setRoomId(roomId);

                // emit room created event
                socket.emit(EVENTS.CLIENT.CREATE_ROOM, { roomId, userId: socket.id });

                navigate(`/room/?roomId=${roomId}`, { replace: true });
            })
            .catch((error) => {
                console.log("error ", error);
                setError("Something went wrong, try again!");
                setLoading(false);
            });
    };

    return (
        <>
            <div className="bg-slate-900 text-gray-100 h-screen w-screen">
                <div className="container h-full max-w-2xl mx-auto my-auto flex flex-col items-center justify-center">
                    <h1 className="text-4xl mb-10">Create new room</h1>

                    <select
                        id="deck"
                        className="bg-slate-700 w-full h-16 rounded-xl text-xl border-0 p-4"
                        required
                        value={deck}
                        onChange={handleChangeDeck}
                    >
                        <option value="hours">
                            Hours (1/2, 1, 2, 4, 8, 12, 16, 24, 32, 40, 48, 56,
                            64, 72, 80, ?)
                        </option>
                        <option value="fibonacci">
                            Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?)
                        </option>
                        <option value="powerof2">
                            Power of 2 (0, 1, 2, 4, 8, 16, 32, 64, ?)
                        </option>
                        <option value="custom">Custom values</option>
                    </select>

                    {showCustomValue && (
                        <>
                            <input
                                className="bg-slate-700 w-full h-16 mt-8 rounded-xl text-xl border-0 p-4 "
                                id="customValue"
                                value={customValue.value}
                                onChange={customValue.onChange}
                            />
                            {customValueError && (
                                <p className="text-xl text-red-300 p-4">
                                    {customValueError}
                                </p>
                            )}
                        </>
                    )}

                    <Button
                        className="h-16 w-96 mt-16 rounded-xl p-4 text-xl font-semibold bg-slate-700 shadow-sm shadow-black hover:scale-110 hover:bg-slate-600 "
                        onClick={createNewRoom}
                        name="createNewRoomBtn"
                        disabled={loading}
                    >
                        New room
                    </Button>

                    {hasError && (
                        <p
                            id="errorMessage"
                            className="text-xl text-red-300 p-4"
                        >
                            {hasError}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

export default CreateRoom;
