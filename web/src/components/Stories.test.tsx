import React from "react";
import data from "../data.json";
import { render, screen } from "@testing-library/react";
import Stories from "./Sidebar";

test("renders sprint stories", () => {
    const [firstStory, ...others] = data.stories;
    render(<Stories stories={data.stories} roomOwner={false}/>);

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
    render(<Stories stories={[]} roomOwner={false}/>);

    const noStories = screen.getByText("No stories...");
    expect(noStories).toBeInTheDocument();
});

test("renders add story button when is room owner", () => {
  render(<Stories stories={[]} roomOwner={true} />);

  const addStoryElement = screen.getByText("Add story");
  expect(addStoryElement).toBeInTheDocument();
});

test("does not render add story button when is not room owner", () => {
  render(<Stories stories={[]} roomOwner={false} />);

  const addStoryElement = screen.queryByText("Add story");
  expect(addStoryElement).toBeNull();
});