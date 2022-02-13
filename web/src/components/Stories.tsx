import React, { useEffect, useState } from "react";
import Story from "../models/Story";


interface StoriesProps {
    stories: Story[];
}

const Stories: React.FC<StoriesProps> = ({ stories }) => {
    const [currentStory, setCurrentStory] = useState<Story | null>();
    const [nextStories, setNextStories] = useState<Story[]>();
    const [votedStories, setVotedStories] = useState<Story[]>();

    useEffect(() => {
        if (!stories) return;
        console.log(stories);

        setCurrentStory(stories[0]);
        if (stories.length > 1) {
            setNextStories(stories.filter((item, index) => index !== 0));
        }
    }, [stories]);

    if (stories.length === 0)
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
