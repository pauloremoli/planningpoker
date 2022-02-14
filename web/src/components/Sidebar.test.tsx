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
    const [firstStory, ...others] = data.stories;
    render(
        <MemoryRouter>
            <Sidebar stories={data.stories} roomOwner={false} />
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

test("click on Add Story button renders CreateStory component", async () => {
    let wrapper = mount(
        <AppProvider username={""} userId={""}>
            <MemoryRouter>
                <Sidebar stories={data.stories} roomOwner={true} />
            </MemoryRouter>
        </AppProvider>
    );

    wrapper.find("#addStory").simulate("click");
    expect(wrapper.find(CreateStory).text()).toContain("Add new story");
});
