import PlayedCard from "./PlayedCard";
import Story from "./Story";

type Room = {
    roomId: string;
    deck: string[];
    votedStories?: Story[];
    nextStories?: Story[];
    roomOwner: string;
    flippedCards: boolean;
    playedCards: PlayedCard[];
    currentStory?: Story;
}

export default Room;