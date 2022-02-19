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
    const [isRoomOwner, setIsRoomOwner] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState<TRoom>();
    const { socket } = useSocket();
    const { roomId, setRoomId, username, setUsername, userId, setUserId } =
        useAppContext();
    const [isRoomClosed, setIsRoomClosed] = useState(false);
    const [showUsernameForm, setShowUsernameForm] = useState(false);

    Modal.setAppElement(document.getElementById("root")!);

    Modal!.defaultStyles!.overlay!.backgroundColor = "rgb(15, 23, 42)";

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

    socket.on(EVENTS.SERVER.JOINED_ROOM, (roomData: TRoom, userId: string) => {
        console.log("EVENTS.SERVER.JOINED_ROOM: ", roomData, "UserId:", userId);

        setData(roomData);
        setLoading(false);
        setUserId(userId);

        console.log("Room owner:", roomData.roomOwner, " userId", userId);

        if (roomData.roomOwner === userId) {
            setIsRoomOwner(true);
            console.log("Room owner:", true);
        }
    });

    socket.on(
        EVENTS.SERVER.PLAYER_JOINED_ROOM,
        (roomData: TRoom, userId: string) => {
            console.log(
                "EVENTS.PLAYER_JOINED_ROOM: ",
                roomData,
                "UserId:",
                userId
            );
            setData(roomData);
        }
    );

    useEffect(() => {
        if (!username) return;
        socket.auth = { username };
        socket.connect();

        console.log("Username changed: ", username);
        console.log(username, " just connected");
        setShowUsernameForm(false);
    }, [username]);

    useEffect(() => {
        setLoading(true);
        const roomIdFromParams = searchParams.get("roomId");
        if (!roomIdFromParams) {
            setError("Room id not found");
            return;
        }

        let id = userId;
        if (!userId) {
            id = localStorage.getItem("userId") || "";

            console.log("READ FROM LOCAL STORAGE id", id);
            if (id) {
                setUserId(id);
            }
        }

        console.log("EVENTS.CLIENT.JOIN_ROOM", username, id);
        socket.emit(EVENTS.CLIENT.JOIN_ROOM, roomIdFromParams, id);

        setRoomId(roomIdFromParams!);
    }, []);

    useEffect(() => {
        console.log("username:", username);

        if (!username) {
            setShowUsernameForm(true);
        }
    }, []);

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

    if (username && isLoading) {
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
                {!isLoading && (
                    <>
                        <Sidebar
                            stories={data!.stories}
                            roomOwner={isRoomOwner}
                        />
                        <Table
                            playedCards={data!.playedCards}
                            deck={data!.deck}
                            roomOwner={isRoomOwner}
                        />

                        <Chat />
                    </>
                )}

                <Modal isOpen={showUsernameForm} style={customStyles}>
                    <UsernameForm setUsername={setUsername} />
                </Modal>
            </>
        </div>
    );
};

export default RoomPage;
