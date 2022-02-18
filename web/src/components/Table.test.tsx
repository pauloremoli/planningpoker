import React from "react";
import data from "../data.json";
import { render, screen } from "@testing-library/react";
import Table from "./Table";

import { configure } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import PlayedCard from "../models/PlayedCard";

configure({ adapter: new Adapter() });

describe("Table tests", () => {
    test("renders control buttons when user is the room owner", () => {
        render(
            <Table playedCards={data.playedCards} deck={data.deck} roomOwner={true} />
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
            <Table playedCards={data.playedCards} deck={data.deck} roomOwner={false} />
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
            <Table playedCards={data.playedCards} deck={data.deck} roomOwner={false} />
        );

        const playedCards = data.playedCards;

        playedCards.map((playedCard: PlayedCard) => {
            const playerElement = screen.getByText(playedCard.username);
            expect(playerElement).toBeInTheDocument();
        });
    });

    test("renders cards", () => {
        render(
            <Table playedCards={data.playedCards} deck={data.deck} roomOwner={false} />
        );

        const cards = data.deck;

        cards.map((card: number) => {
            const cardElement = screen.getByText(card.toString());
            expect(cardElement).toBeInTheDocument();
        });

        const questionMarkElement = screen.getByText("?");
        expect(questionMarkElement).toBeInTheDocument();
    });
});
