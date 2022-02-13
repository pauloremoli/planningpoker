import { configure, shallow } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Button from "./Button";

configure({ adapter: new Adapter() });

test("render button", () => {
    const wrapper = shallow(
        <Button className="bg-slate-700">Test</Button>
    );
    expect(wrapper.find("button").text()).toBe("Test");
});

test("callback is called on click", () => {

    const mockCallBack = jest.fn();
    const wrapper = shallow(
        <Button className="bg-slate-700" onClick={mockCallBack} name="testButton">Test</Button>
    );

    expect(wrapper.find("button").text()).toBe("Test");

    expect(wrapper.find("button").props().className).toContain("bg-slate-700");

    expect(wrapper.find("button").props().id).toBe("testButton");
    wrapper.find("button").simulate("click");

    expect(mockCallBack.mock.calls.length).toEqual(1);
});
