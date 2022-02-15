import PlayedCard from "./PlayedCard";
import Story from "./Story";

type TRoom = {
    roomId: string;
    deck: number[];
    stories: Story[];
    roomOwner: string;
    playedCards: PlayedCard[];
}

export default TRoom;