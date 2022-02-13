import PlayedCard from "./PlayedCard";
import Story from "./Story";

type Room = {
    roomId: string;
    deck: number[];
    stories: Story[];
    players: string[];
    roomOwner: string;
    playedCards: PlayedCard[];
}

export default Room;