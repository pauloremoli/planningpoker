import React, { useState } from "react";

interface ChatProps {}

const Chat: React.FC<ChatProps> = () => {
    return (
        <div className="w-80 py-10 pl-8 bg-slate-800 flex flex-col  h-screen justify-between">
            <h1 id="chatTitle" className="font-semibold text-xl">Chat</h1>

            <input
                type="text"
                placeholder="message..."
                className="bg-white text-black p-4 w-64 mr-8 h-26 rounded-lg "
            />
        </div>
    );
};

export default Chat;
