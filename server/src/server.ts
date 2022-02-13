import { httpServer, closeServer, io } from "./app";
import socket from "./socket";

const PORT = process.env.APP_PORT;
httpServer.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);

    socket({ io });
});

process.on("SIGTERM", () => {
    console.log("Closing HTTP server");
    closeServer();
});
