import React, { useEffect, useState } from "react";
import Button from "./Button";
import CreateStory from "./CreateStory";
import Stories from "./Stories";
import Modal from "react-modal";
import Story from "../models/Story";
import { Link } from "react-router-dom";
import { useSocket } from "../socket/SocketContext";
import EVENTS from "../socket/events";

interface SidebarProps {
    stories?: Story[];
    roomOwner: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
    stories: pStories = [],
    roomOwner,
}) => {
    const [isRoomOwner, setRoomOwner] = useState(false);
    const [showAddStory, setShowAddStory] = useState(false);
    const [stories, setStories] = useState<Story[]>(pStories);
    const {socket} = useSocket();

    Modal.setAppElement(document.getElementById("root")!);

    Modal!.defaultStyles!.overlay!.backgroundColor = "rgb(0, 0, 0, 0.75)";


    socket.on(EVENTS.SERVER.NEW_STORY, (story: Story) => {
        console.log("New story added: ", story);
        addStory(story.name, story.description!);
    });

    const customStyles = {
        content: {
            width: "50%",
            height: "750px",
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
        },
    };

    const closeModal = () => {
        setShowAddStory(false);
    };

    useEffect(() => {
        setRoomOwner(roomOwner);
    }, [roomOwner]);

    const addStoryHandler = () => {
        setShowAddStory(true);
    };

    const addStory = (name: string, description: string) => {
        setStories([...stories, { name, description, points: 0 }]);
    };

    return (
        <div className="w-80 py-10 pl-8 bg-slate-800 flex flex-col justify-between h-screen">
            <Link to="/">
                <h1 id="title" className="text-4xl font-bold">
                    Planning Poker
                </h1>
            </Link>
            <Stories stories={stories} />

            {isRoomOwner && (
                <>
                    <Button
                        name="addStory"
                        onClick={addStoryHandler}
                        className="bg-slate-700 p-4 w-64 mr-8 h-16 rounded-lg font-semibold "
                    >
                        Add story
                    </Button>
                    <Modal
                        isOpen={showAddStory}
                        onRequestClose={closeModal}
                        style={customStyles}
                    >
                        <CreateStory
                            closeModal={closeModal}
                            addStory={addStory}
                        />
                    </Modal>
                </>
            )}
        </div>
    );
};

export default Sidebar;
