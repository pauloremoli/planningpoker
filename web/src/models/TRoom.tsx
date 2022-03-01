import PlayedCard from "./PlayedCard";
import Story from "./Story";

type TRoom = {
    roomId: string;
    deck: string[];
    votedStories: Story[];
    nextStories: Story[];
    currentStory: Story;
    roomOwner: string;
    playedCards: PlayedCard[];
};

export default TRoom;
