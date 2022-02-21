import React, { useEffect, useState } from "react";
import Story from "../models/Story";

interface StoriesProps {
    next?: Story[];
    voted?: Story[];
    current?: Story;
}

const Stories: React.FC<StoriesProps> = ({ next, current, voted }) => {
    const [currentStory, setCurrentStory] = useState<Story | undefined>(
        current
    );
    const [nextStories, setNextStories] = useState<Story[] | undefined>(next);
    const [votedStories, setVotedStories] = useState<Story[] | undefined>(
        voted
    );

    useEffect(() => {
        setCurrentStory(current);
    }, [current]);

    useEffect(() => {
        setNextStories(next);
    }, [next]);

    useEffect(() => {
        setVotedStories(voted);
    }, [voted]);

    if (!currentStory)
        return (
            <>
                <div className="py-10 text-xl flex flex-col justify-between h-full">
                    <h3>No stories...</h3>
                </div>
            </>
        );

    return (
        <div className="py-10 text-xl flex flex-col justify-between h-full">
            {currentStory && (
                <div className="justify-start">
                    <h3 className="font-semibold">Voting now:</h3>
                    <h3 className="pt-2">{currentStory.name}</h3>
                </div>
            )}

            {nextStories && (
                <div>
                    <h3 className="font-semibold pt-10">Next:</h3>
                    <ul>
                        {nextStories.map((story: Story, index: number) => {
                            return (
                                <li key={"id" + index} className="py-2">
                                    <h3>{story.name}</h3>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {votedStories && (
                <div className="next justify-end">
                    <div>
                        <h3 className="font-semibold pt-8">Voted:</h3>
                        <ul>
                            {votedStories.map((story: Story, index: number) => {
                                return (
                                    <li key={"id" + index}>
                                        <h3>{story.name}</h3>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stories;
