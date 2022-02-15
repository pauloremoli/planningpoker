import { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import SERVER from "../api/constants";
import EVENTS from "./events";

type Message = {
    message: string;
    username: string;
    time: string;
};

interface Context {
    socket: Socket;
    messages?: { message: string; time: string; username: string }[];
    setMessages: Function;
}

const socket = io(SERVER, { transports: ["websocket"], upgrade: false });

const SocketContext = createContext<Context>({
    socket,
    setMessages: () => false,
    messages: [],
});

function SocketProvider(props: any) {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected: ", socket.id);
        });

        socket.on("disconnect", (reason) => {
            console.log("Disconnected", reason);
          });

        socket.on(
            EVENTS.SERVER.ROOM_MESSAGE,
            ({ message, username, time }: Message) => {
                console.log("ROOM_MESSAGE: ", message);

                setMessages((messages: Message[]) => [
                    ...messages,
                    { message, username, time },
                ]);
            }
        );

        socket.on(
            EVENTS.SERVER.ROOM_MESSAGE,
            ({ message, username, time }: Message) => {
                console.log("ROOM_MESSAGE: ", message);

                setMessages((messages: Message[]) => [
                    ...messages,
                    { message, username, time },
                ]);
            }
        );
    }, []);

    return (
        <SocketContext.Provider
            value={{
                socket,
                messages,
                setMessages,
            }}
            {...props}
        />
    );
}

export const useSocket = () => useContext(SocketContext);

export default SocketProvider;
