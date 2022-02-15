import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../components/AppContext";
import UsernameForm from "../components/UsernameForm";

export type RoomData = {
    roomId: string;
};

const Welcome: React.FC = () => {
    let navigate = useNavigate();
    const { setUsername } = useAppContext();

    const handleSetUsername = (username: string) => {
        setUsername(username);
        navigate("/create_room", { replace: false });
    };

    return (
        <>
            <div className="bg-slate-400 text-gray-100 h-screen w-screen">
                <div className="container h-full max-w-2xl mx-auto my-auto flex flex-col items-center justify-center">
                    <UsernameForm setUsername={handleSetUsername} />
                </div>
            </div>
        </>
    );
};

export default Welcome;
