import PlayedCard from "./PlayedCard";
import Story from "./Story";

type Room = {
    roomId: string;
    deck: string[];
    stories: Story[];
    roomOwner: string;
    flippedCards: boolean;
    playedCards: PlayedCard[];
}

export default Room;