import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import axios from "axios";
import { configure, shallow } from "enzyme";
import { MemoryRouter } from "react-router-dom";
import AppProvider from "../components/AppContext";
import Room from "./room";

configure({ adapter: new Adapter() });

test("renders room initial state", () => {
	const wrapper = shallow(
		<MemoryRouter>
			<AppProvider username={"Username"} userId={"id1"}>
				<Room />
			</AppProvider>
		</MemoryRouter>
	);

	const resp = {
		players: ["Player 1", "Player 2"],
		deck: ["1", "2", "4", "8", "16", "?"],
		roomOwner: "1",
		stories: [{ name: "Story 1", description: "Description" }],
	};
	axios.get = jest.fn().mockResolvedValue(resp);
});
