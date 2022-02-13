import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { get } from "../api/api";
import { useAppContext } from "../components/AppContext";
import Chat from "../components/Chat";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
import Room from "../models/Room";
import EVENTS from "../socket/events";
import { useSocket } from "../socket/SocketContext";

const RoomPage: React.FC = () => {
    const [isRoomOwner, setIsRoomOwner] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState<Room | undefined>(undefined);
    const { socket } = useSocket();
    const { roomId, setRoomId } = useAppContext();
    const [isRoomClosed, setIsRoomClosed] = useState(false);

    socket.on(EVENTS.SERVER.ROOM_CLOSED, (roomId: string) => {
        console.log("Room is closed: ", roomId);
        setIsRoomClosed(true);
    });

    useEffect(() => {
        setLoading(true);
        const roomIdFromParams = searchParams.get("roomId");
        console.log("roomIdFromParams: ", roomIdFromParams);
        if (!roomIdFromParams) {
            setError("Room id not found");

            return;
        }

        socket.on("connect", () => {
            console.log(socket.id);
            socket.emit(EVENTS.CLIENT.JOIN_ROOM, roomIdFromParams, socket.id);
        });

        setRoomId(roomIdFromParams!);

        get<Room>("/room", { roomId: roomIdFromParams })
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);

                setError("Something went wrong, try again!");
                setLoading(false);
            });
    }, [searchParams, setRoomId]);

    if (isRoomClosed) {
        return (
            <>
                <div className="bg-slate-900  text-gray-100 flex flex-col w-screen h-screen justify-center items-center">
                    <p className="text-4xl">This room doesn't exist anymore.</p>
                    <p className="font-semibold text-2xl mt-4">
                        <Link to="/">Click here to create a new room.</Link>
                    </p>
                </div>
            </>
        );
    }

    if (isLoading) {
        return (
            <>
                <div className="bg-slate-900  text-gray-100 flex w-screen h-screen justify-center items-center">
                    <p>loading...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <div className="bg-slate-900  text-grasearchParamsy-100 flex w-screen h-screen justify-center">
                    <p>{error}</p>
                </div>
            </>
        );
    }

    return (
        <div className="bg-slate-900  text-gray-100 flex w-full">
            <>
                <Sidebar stories={data!.stories} roomOwner={isRoomOwner} />
                <Table
                    players={data!.players}
                    deck={data!.deck}
                    roomOwner={isRoomOwner}
                />

                <Chat />
            </>
        </div>
    );
};

export default RoomPage;
