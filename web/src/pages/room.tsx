import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAppContext } from "../components/AppContext";
import Chat from "../components/Chat";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
import TRoom from "../models/Room";
import EVENTS from "../socket/events";
import { useSocket } from "../socket/SocketContext";
import Modal from "react-modal";
import UsernameForm from "../components/UsernameForm";

const RoomPage: React.FC = () => {
    const [isRoomOwner, setIsRoomOwner] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState<TRoom>();
    const { socket } = useSocket();
    const { roomId, setRoomId, username, setUsername } = useAppContext();
    const [isRoomClosed, setIsRoomClosed] = useState(false);
    const [showUsernameForm, setShowUsernameForm] = useState(false);

    Modal.setAppElement(document.getElementById("root")!);

    Modal!.defaultStyles!.overlay!.backgroundColor = "rgb(0, 0, 0, 0.75)";

    const customStyles = {
        content: {
            width: "50%",
            height: "550px",
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
        },
    };

    socket.on(EVENTS.SERVER.ROOM_CLOSED, (roomId: string) => {
        console.log("Room is closed: ", roomId);
        setIsRoomClosed(true);
    });

    socket.on(EVENTS.SERVER.JOINED_ROOM, (roomData: TRoom) => {
        if (roomData.roomId === roomId) {
            console.log("New player joined: ", roomData);
            setData(roomData);
            setLoading(false);
        }
    });

    useEffect(() => {
        setLoading(true);

        if(!username)
            return;

        const roomIdFromParams = searchParams.get("roomId");
        if (!roomIdFromParams) {
            setError("Room id not found");

            return;
        }

        console.log("EVENTS.CLIENT.JOIN_ROOM", username);
        socket.emit(EVENTS.CLIENT.JOIN_ROOM, roomIdFromParams, username);

        setRoomId(roomIdFromParams!);
    }, [searchParams, setRoomId]);

    

    useEffect(() => {
        console.log("username:", username);
        
        setShowUsernameForm(!username);
    }, [username]);

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
                    <p className="text-2xl">loading...</p>
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
                    playedCards={data!.playedCards}
                    deck={data!.deck}
                    roomOwner={isRoomOwner}
                />

                <Chat />
                <Modal isOpen={showUsernameForm} style={customStyles}>
                    <UsernameForm setUsername={setUsername} />
                </Modal>
            </>
        </div>
    );
};

export default RoomPage;
