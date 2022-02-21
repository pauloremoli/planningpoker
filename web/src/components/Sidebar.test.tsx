import React from "react";
import data from "../data.json";
import { render, screen } from "@testing-library/react";
import Sidebar from "./Sidebar";
import CreateStory from "./CreateStory";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { configure, mount } from "enzyme";
import AppProvider from "./AppContext";
import { MemoryRouter } from "react-router-dom";

configure({ adapter: new Adapter() });

test("renders sidebar stories", () => {
    render(
        <MemoryRouter>
            <Sidebar current={data.currentStory} next={data.nextStories} roomOwner={false} />
        </MemoryRouter>
    );

    const votingNowElement = screen.getByText("Voting now:");
    expect(votingNowElement).toBeInTheDocument();

    const firstStoryElement = screen.getByText(data.currentStory.name);
    expect(firstStoryElement).toBeInTheDocument();

    const secondStoryElement = screen.getByText(data.nextStories[0].name);
    expect(secondStoryElement).toBeInTheDocument();

    const thirdStoryElement = screen.getByText(data.nextStories[1].name);
    expect(thirdStoryElement).toBeInTheDocument();
});

test("click on Add Story button renders CreateStory component", async () => {
    let wrapper = mount(
        <AppProvider username={""} userId={""}>
            <MemoryRouter>
                <Sidebar current={data.currentStory} roomOwner={true} />
            </MemoryRouter>
        </AppProvider>
    );

    wrapper.find("#addStory").simulate("click");
    expect(wrapper.find(CreateStory).text()).toContain("Add new story");
});
