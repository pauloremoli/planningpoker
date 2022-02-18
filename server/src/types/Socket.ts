import io from "socket.io";
interface Socket extends io.Socket {
    username: string;
    userId: string;
}

export default Socket;
