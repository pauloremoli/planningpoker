import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import SERVER from "../api/constants";
import AppProvider from "./AppContext";
import CreateStory from "./CreateStory";
import axios from "axios";

jest.mock("axios");

describe("Test create story", () => {
	test("click on Add Story button renders CreateStory component", async () => {
		const roomId = "1";
		render(
			<MemoryRouter>
				<AppProvider username={"User 1"} userId={"1"} roomId={roomId}>
					<CreateStory />
				</AppProvider>
			</MemoryRouter>
		);

		fireEvent.input(screen.getByTestId("storyName"), {
			target: {
				value: "Story 1",
			},
		});

		fireEvent.input(screen.getByTestId("description"), {
			target: {
				value: "Task description",
			},
		});

		const resp = {};
		axios.post = jest.fn().mockResolvedValue(resp);

		fireEvent.submit(screen.getByTestId("addButton"));

		expect(axios.post).toHaveBeenCalledWith(SERVER + "/addStory", {
			roomId,
			story: {
				name: "Story 1",
				description: "Task description",
				points: 0,
			},
		});
	});

	test("renders error message when create room fails", async () => {
		const roomId = "1";
		render(
			<MemoryRouter>
				<AppProvider username={"User 1"} userId={"1"} roomId={roomId}>
					<CreateStory />
				</AppProvider>
			</MemoryRouter>
		);

		fireEvent.input(screen.getByTestId("storyName"), {
			target: {
				value: "Story 1",
			},
		});

		fireEvent.input(screen.getByTestId("description"), {
			target: {
				value: "Task description",
			},
		});

		axios.post = jest.fn().mockRejectedValueOnce({ error: "exception" });

		fireEvent.submit(screen.getByTestId("addButton"));

		expect(axios.post).toHaveBeenCalledWith(SERVER + "/addStory", {
			roomId,
			story: {
				name: "Story 1",
				description: "Do your job",
				points: 0,
			},
		});

		await waitFor(() => {
			expect(
				screen.getByText("Something went wrong, please try again!")
			).toBeInTheDocument();
		});
	});
});
