import React, { useEffect, useState } from "react";
import TStatistics from "../models/TStatistics";

interface ScoreProps {
	statistics: TStatistics;
}

const Score: React.FC<ScoreProps> = ({ statistics }) => {
	const [stats, setStats] = useState(statistics);

	useEffect(() => {
		setStats(statistics);
	}, [statistics]);

	if (
		!stats ||
		stats.min.length !== 0 ||
		stats.max.length !== 0 ||
		stats.average
	) {
		return (
			<>
				<h3 className="text-white text-2xl">Nothing to show</h3>
			</>
		);
	}
	return (
		<div className="flex flex-col text-white text-2xl w-full h-full">
			<h3>Score</h3>
			Average: {stats.average}
			Lowest: {stats.min[0].card}
			Highest: {stats.max[0].card}
		</div>
	);
};

export default Score;
