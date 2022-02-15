import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppContext from "./components/AppContext";
import "./css/tailwind.css";
import CreateRoom from "./pages/createRoom";
import RoomPage from "./pages/room";
import Welcome from "./pages/welcome";
import reportWebVitals from "./reportWebVitals";
import SocketContext from "./socket/SocketContext";

const username = localStorage.getItem("username");

ReactDOM.render(
    <React.StrictMode>
        <AppContext userId="" username={username ? username : ""}>
            <SocketContext>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Welcome />} />
                        <Route path="/create_room" element={<CreateRoom />} />
                        <Route path="/room/" element={<RoomPage />} />
                    </Routes>
                </BrowserRouter>
            </SocketContext>
        </AppContext>
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
