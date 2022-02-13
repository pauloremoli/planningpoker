import Card from "./Card";

import { configure, shallow } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

configure({ adapter: new Adapter() });

test("render value of the card", () => {
    const wrapper = shallow(
        <Card value={"2"} flipped={true} id={"0"} isSelected={false} />
    );
    expect(wrapper.find("button").text()).toBe("2");
});

test("render back of the card", () => {
    const wrapper = shallow(
        <Card value={null} flipped={false} id={"0"} isSelected={false} />
    );
    expect(wrapper.find("button").text()).toBe("");
});
