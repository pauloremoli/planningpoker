import { render, screen } from "@testing-library/react";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { configure } from "enzyme";
import React from "react";
import data from "../data.json";
import PlayedCard from "../models/PlayedCard";
import AppProvider from "./AppContext";
import Table from "./Table";

configure({ adapter: new Adapter() });

describe("Table tests", () => {
	test("renders control buttons when user is the room owner", () => {
		render(
			<AppProvider userId="1" username="User 1">
				<Table
					cards={data.playedCards}
					deck={data.deck}
					roomOwner={true}
				/>
			</AppProvider>
		);
		const flipElement = screen.getByText("Flip");
		expect(flipElement).toBeInTheDocument();
		const resetElement = screen.getByText("Reset");
		expect(resetElement).toBeInTheDocument();
		const nextElement = screen.getByText("Next");
		expect(nextElement).toBeInTheDocument();
	});

	test("does not render control buttons when user is not room owner", () => {
		render(
			<AppProvider userId="1" username="User 1">
				<Table
					cards={data.playedCards}
					deck={data.deck}
					roomOwner={false}
				/>
			</AppProvider>
		);
		const flipElement = screen.queryByText("Flip");
		expect(flipElement).toBeNull();
		const resetElement = screen.queryByText("Reset");
		expect(resetElement).toBeNull();
		const nextElement = screen.queryByText("Next");
		expect(nextElement).toBeNull();
	});

	test("renders players", () => {
		render(
			<AppProvider userId="1" username="User 1">
				<Table
					cards={data.playedCards}
					deck={data.deck}
					roomOwner={false}
				/>
			</AppProvider>
		);

		const playedCards = data.playedCards;

		playedCards.map((playedCard: PlayedCard) => {
			const playerElement = screen.getByText(playedCard.username);
			expect(playerElement).toBeInTheDocument();
		});
	});

	test("renders cards", () => {
		render(
			<AppProvider userId="1" username="User 1">
				<Table
					cards={data.playedCards}
					deck={data.deck}
					roomOwner={false}
				/>
			</AppProvider>
		);

		const cards = data.deck;

		cards.map((card: string) => {
			const cardElement = screen.getByText(card);
			expect(cardElement).toBeInTheDocument();
		});

		const questionMarkElement = screen.getByText("?");
		expect(questionMarkElement).toBeInTheDocument();
	});
});
