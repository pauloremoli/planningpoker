import { waitFor } from "@testing-library/react";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { configure, mount, ReactWrapper } from "enzyme";
import mockAxios from "jest-mock-axios";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import SERVER from "../api/constants";
import AppProvider from "./AppContext";
import CreateStory from "./CreateStory";

const chageInputValue = (
    wrapper: ReactWrapper<any, Readonly<{}>, React.Component<{}, {}, any>>,
    id: string,
    value: string
) => {
    wrapper.find(id).simulate("change", { target: { value } });
};

configure({ adapter: new Adapter() });

describe("Test create story", () => {
    afterEach(() => {
        mockAxios.reset();
    });

    test("renders form for creating a story", async () => {
        let wrapper = mount(
            <AppProvider username={""} userId={""} roomId={"1"}>
                <CreateStory />
            </AppProvider>
        );

        expect(wrapper.find("#storyName").props().placeholder).toContain(
            "Name"
        );
        expect(wrapper.find("#description").props().placeholder).toContain(
            "Description"
        );

        expect(wrapper.find("#addButton").text()).toContain("Add");
    });

    test("click on Add Story button renders CreateStory component", async () => {
        const roomId = "1";
        const wrapper = mount(
            <MemoryRouter>
                <AppProvider username={""} userId={""} roomId={roomId}>
                    <CreateStory />
                </AppProvider>
            </MemoryRouter>
        );

        chageInputValue(wrapper, "#storyName", "Story 1");
        chageInputValue(wrapper, "#description", "Do your job");

        const resp = {};
        mockAxios.post.mockResolvedValueOnce(resp);

        await act(async () => {
            wrapper.find("form").simulate("submit");
        });

        expect(mockAxios.post).toHaveBeenCalledWith(SERVER + "/addStory", {
            name: "Story 1",
            description: "Do your job",
        });
    });

    test("renders error message when create room fails", async () => {
        const roomId = "1";
        let wrapper = mount(
            <AppProvider username={""} userId={""} roomId={roomId}>
                <CreateStory />
            </AppProvider>
        );

        mockAxios.get.mockRejectedValueOnce({ error: "exception" });

        expect(wrapper.contains("#errorMessage")).toBeFalsy();

        chageInputValue(wrapper, "#storyName", "Story 1");
        chageInputValue(wrapper, "#description", "Do your job");

        await act(async () => {
            wrapper.find("form").simulate("submit");
        });
        
        expect(mockAxios.post).toHaveBeenCalledWith(SERVER + "/addStory", {
            name: "Story 1",
            description: "Do your job",
        });

        await waitFor(() => {
            expect(wrapper.find("#errorMessage").text()).toBe(
                "Something went wrong, please try again!"
            );
        });
    });
});
