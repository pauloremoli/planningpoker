import { waitFor } from "@testing-library/react";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import mockAxios from "jest-mock-axios";
import { configure, mount, ReactWrapper } from "enzyme";
import { useNavigate } from "react-router-dom";
import SERVER from "../api/constants";
import CreateRoom from "./createRoom";
import AppProvider from "../components/AppContext";

configure({ adapter: new Adapter() });

jest.mock("react-router-dom");

describe("Create room tests", () => {
    let wrapper: ReactWrapper;
    beforeEach(() => {
        wrapper = mount(
            <AppProvider username={""} userId={""}>
                <CreateRoom />
            </AppProvider>
        );
    });
    afterEach(() => {
        mockAxios.reset();
    });

    test("renders form for room creation", () => {
        expect(wrapper.find("h1").text()).toBe("Create new room");

        expect(wrapper.find("select").text()).toContain("Hours");
        expect(wrapper.find("select").text()).toContain("Fibonacci");
        expect(wrapper.find("select").text()).toContain("Power of 2");
        expect(wrapper.find("select").text()).toContain("Custom values");

        expect(wrapper.find("#createNewRoomBtn").text()).toContain("New room");
    });

    test("renders custom values input field when custom values is selected", () => {
        wrapper
            .find("select")
            .simulate("change", { target: { value: "custom" } });

        expect(wrapper.find("select").props().value).toBe("custom");
        expect(wrapper.find("#customValue").props().value).toBe(
            "0, 1, 2, 4, 8, 16, 32, 64"
        );

        wrapper
            .find("select")
            .simulate("change", { target: { value: "fibonacci" } });

        expect(wrapper.contains("#customValue")).toBeFalsy();
    });

    test("shows validation error for invalid custom value", () => {
        wrapper
            .find("select")
            .simulate("change", { target: { value: "custom" } });

        expect(wrapper.find("select").props().value).toBe("custom");
        wrapper.find("#customValue").simulate("change", {
            target: { value: "0, 1, 2, 4, a, 8, 16, 32, 64" },
        });
    });

    test("on create room click should call redirect to room id returned from service", async () => {
        const roomId = "1";
        const resp = { data: { roomId } };
        mockAxios.get.mockResolvedValueOnce(resp);
        wrapper.find("#createNewRoomBtn").simulate("click");
        expect(useNavigate).toHaveBeenCalled();

        expect(mockAxios.post).toHaveBeenCalledWith(SERVER + "/createRoom", {
            deck: [0.5, 1, 2, 4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 72, 80],
        });
    });

    test("renders error message when create room fails", async () => {
        mockAxios.post.mockRejectedValueOnce({ error: "exception" });

        expect(wrapper.contains("#errorMessage")).toBeFalsy();

        expect(useNavigate).toHaveBeenCalled();

        await waitFor(() => {
            wrapper.find("#createNewRoomBtn").simulate("click");
            expect(wrapper.find("#errorMessage").text()).toBe(
                "Something went wrong, try again!"
            );
        });

        expect(mockAxios.post).toHaveBeenCalledWith(SERVER + "/createRoom", {
            deck: [0.5, 1, 2, 4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 72, 80],
        });
    });
});
