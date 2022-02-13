import AppProvider, { useAppContext } from "./AppContext";
import { render, screen } from "@testing-library/react";
import { configure, mount } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

configure({ adapter: new Adapter() });

export const ShowUser = () => {
    const { username, userId, setUsername, setUserId } = useAppContext()!;

    const changeData = () => {
        setUsername("User 2");

        setUserId("id2");
    };
    return (
        <div>
            <h1 id="username">{username}</h1>
            <h1 id="id">{userId}</h1>

            <button onClick={changeData}>Change</button>
        </div>
    );
};

test("useAppContext return proper value", () => {
    render(
        <AppProvider username={"User"} userId={"id1"}>
            <ShowUser />
        </AppProvider>
    );
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("id1")).toBeInTheDocument();
});

test("updates username in context", () => {
    const wrapper = mount(
        <AppProvider username={"User"} userId={"id1"}>
            <ShowUser />
        </AppProvider>
    );

    expect(wrapper.find("#username").text()).toBe("User");
    expect(wrapper.find("#id").text()).toBe("id1");

    wrapper.find("button").simulate("click");

    expect(wrapper.find("#username").text()).toBe("User 2");
    expect(wrapper.find("#id").text()).toBe("id2");
});
