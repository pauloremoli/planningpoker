import React from "react";
import data from "../data.json";
import { render, screen } from "@testing-library/react";
import Stories from "./Sidebar";
import { MemoryRouter } from "react-router-dom";

test("renders sprint stories", () => {
    const [firstStory, ...others] = data.stories;
    render(
        <MemoryRouter>
            <Stories stories={data.stories} roomOwner={false} />
        </MemoryRouter>
    );

    const votingNowElement = screen.getByText("Voting now:");
    expect(votingNowElement).toBeInTheDocument();

    const firstStoryElement = screen.getByText(firstStory.name);
    expect(firstStoryElement).toBeInTheDocument();

    const secondStoryElement = screen.getByText(others[0].name);
    expect(secondStoryElement).toBeInTheDocument();

    const thirdStoryElement = screen.getByText(others[1].name);
    expect(thirdStoryElement).toBeInTheDocument();
});

test("renders no stories when given empty data", () => {
    render(
        <MemoryRouter>
            <Stories stories={[]} roomOwner={false} />
        </MemoryRouter>
    );

    const noStories = screen.getByText("No stories...");
    expect(noStories).toBeInTheDocument();
});

test("renders add story button when is room owner", () => {
    render(
        <MemoryRouter>
            <Stories stories={[]} roomOwner={true} />
        </MemoryRouter>
    );

    const addStoryElement = screen.getByText("Add story");
    expect(addStoryElement).toBeInTheDocument();
});

test("does not render add story button when is not room owner", () => {
    render(
        <MemoryRouter>
            <Stories stories={[]} roomOwner={false} />
        </MemoryRouter>
    );

    const addStoryElement = screen.queryByText("Add story");
    expect(addStoryElement).toBeNull();
});
