import { calculateStatistics } from "./socket";
import PlayedCard from "./types/PlayedCard";

describe("Test server business logic", () => {
	it("Simple min, max, average test", () => {
		const playedCards: PlayedCard[] = [
			{
				username: "User 1",
				userId: "1",
				card: "10",
			},
			{
				username: "User 2",
				userId: "2",
				card: "30",
			},
			{
				username: "User 3",
				userId: "3",
				card: "50",
			},
		];

		const { min, max, average } = calculateStatistics(playedCards);
		expect(min).toStrictEqual([
			{
				username: "User 1",
				userId: "1",
				card: "10",
			},
		]);
		expect(max).toStrictEqual([
			{
				username: "User 3",
				userId: "3",
				card: "50",
			},
		]);
		expect(average).toBe(30);
	});

	it("Two players with same highest card", () => {
		const playedCards: PlayedCard[] = [
			{
				username: "User 1",
				userId: "1",
				card: "10",
			},
			{
				username: "User 2",
				userId: "2",
				card: "40",
			},
			{
				username: "User 3",
				userId: "3",
				card: "40",
			},
		];

		const { min, max, average } = calculateStatistics(playedCards);
		expect(min).toStrictEqual([
			{
				username: "User 1",
				userId: "1",
				card: "10",
			},
		]);
		expect(max).toStrictEqual([
			{
				username: "User 2",
				userId: "2",
				card: "40",
			},
			{
				username: "User 3",
				userId: "3",
				card: "40",
			},
		]);
		expect(average).toBe(30);
	});

	it("Two players with same lowest card", () => {
		const playedCards: PlayedCard[] = [
			{
				username: "User 1",
				userId: "1",
				card: "10",
			},
			{
				username: "User 2",
				userId: "2",
				card: "10",
			},
			{
				username: "User 3",
				userId: "3",
				card: "70",
			},
		];

		const { min, max, average } = calculateStatistics(playedCards);
		expect(min).toStrictEqual([
			{
				username: "User 1",
				userId: "1",
				card: "10",
			},
			{
				username: "User 2",
				userId: "2",
				card: "10",
			},
		]);
		expect(max).toStrictEqual([
			{
				username: "User 3",
				userId: "3",
				card: "70",
			},
		]);
		expect(average).toBe(30);
	});

	it("Same card played by all", () => {
		const playedCards: PlayedCard[] = [
			{
				username: "User 1",
				userId: "1",
				card: "10",
			},
			{
				username: "User 2",
				userId: "2",
				card: "10",
			},
			{
				username: "User 3",
				userId: "3",
				card: "10",
			},
		];

		const { min, max, average } = calculateStatistics(playedCards);
		expect(min).toStrictEqual([
			{
				username: "User 1",
				userId: "1",
				card: "10",
			},
			{
				username: "User 2",
				userId: "2",
				card: "10",
			},
			{
				username: "User 3",
				userId: "3",
				card: "10",
			},
		]);
		expect(max).toStrictEqual([
			{
				username: "User 1",
				userId: "1",
				card: "10",
			},
			{
				username: "User 2",
				userId: "2",
				card: "10",
			},
			{
				username: "User 3",
				userId: "3",
				card: "10",
			},
		]);
		expect(average).toBe(10);
	});
});
