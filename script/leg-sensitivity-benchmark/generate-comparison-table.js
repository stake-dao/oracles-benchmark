const fs = require("node:fs");
const path = require("node:path");

const DATA_ROOT = path.join("data", "leg-sensitivity-benchmark");
const CSV_DIR = path.join("assets", "leg-sensitivity-benchmark", "csv");
const OUTPUT_ROOT = path.join("assets", "leg-sensitivity-benchmark");

function ensureDir(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

function discoverPoolTypes() {
	if (!fs.existsSync(DATA_ROOT)) {
		return [];
	}

	return fs
		.readdirSync(DATA_ROOT, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);
}

function discoverPools(poolType) {
	const poolTypePath = path.join(DATA_ROOT, poolType);
	if (!fs.existsSync(poolTypePath)) {
		return [];
	}

	return fs
		.readdirSync(poolTypePath, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);
}

function loadSummary(poolType, poolName) {
	const filePath = path.join(
		CSV_DIR,
		`leg-summary-${poolType}-${poolName.replace(/[\\/\\\\]/g, "")}.csv`,
	);

	if (!fs.existsSync(filePath)) {
		return null;
	}

	const lines = fs
		.readFileSync(filePath, "utf8")
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

	if (lines.length < 2) {
		return null;
	}

	const headers = lines[0].split(",").map((value) => value.trim());
	const legs = headers.slice(1);
	const rows = lines.slice(1).map((line) => {
		const parts = line.split(",").map((value) => value.trim());
		return {
			metric: parts[0],
			values: parts.slice(1),
		};
	});

	return { legs, rows };
}

const EPSILON = 1e-9;

function parseNumber(value) {
	if (value === undefined || value === null) return null;
	const cleaned = value.replace(/%/g, "");
	if (cleaned === "") return null;
	const num = Number.parseFloat(cleaned);
	return Number.isNaN(num) ? null : num;
}

function findRow(rows, predicate) {
	return rows.find((row) => predicate(row.metric));
}

function collectMetricRow(summary, matcher) {
	return findRow(summary.rows, (name) => matcher(name.toLowerCase()));
}

function pickWinners(row, preferLower = true) {
	if (!row) return null;

	const numericValues = row.values.map((value) => parseNumber(value));
	let bestValue = preferLower ? Infinity : -Infinity;
	let winners = [];

	numericValues.forEach((value, index) => {
		if (value === null) return;
		if (
			(preferLower && value < bestValue - EPSILON) ||
			(!preferLower && value > bestValue + EPSILON)
		) {
			bestValue = value;
			winners = [index];
		} else if (Math.abs(value - bestValue) <= EPSILON) {
			winners.push(index);
		}
	});

	if (!winners.length) {
		return null;
	}

	return {
		winners,
		displayValues: winners.map((index) => row.values[index]),
		bestValue,
	};
}

function formatWinners(summary, winners, displayValues) {
	const legs = winners.map((index) => summary.legs[index]);
	const labels = legs.join(", ");
	const value = displayValues[0];
	return `${labels} (${value})`;
}

function buildHighlights(summary) {
	const highlights = [];

	const volatilityRow = collectMetricRow(
		summary,
		(name) => name === "volatility (%)",
	);
	const volatilityWinners = pickWinners(volatilityRow);
	if (volatilityWinners) {
		highlights.push(
			`Lowest volatility: ${formatWinners(summary, volatilityWinners.winners, volatilityWinners.displayValues)}`,
		);
	}

	const drawdownRow = collectMetricRow(
		summary,
		(name) => name === "max drawdown (%)",
	);
	const drawdownWinners = pickWinners(drawdownRow);
	if (drawdownWinners) {
		highlights.push(
			`Smallest drawdown: ${formatWinners(summary, drawdownWinners.winners, drawdownWinners.displayValues)}`,
		);
	}

	const stdDevRow = collectMetricRow(
		summary,
		(name) => name === "std dev price",
	);

	const recommendation = buildRecommendation(
		summary,
		volatilityRow,
		drawdownRow,
		stdDevRow,
	);
	if (recommendation) {
		highlights.push(recommendation);
	}

	return highlights;
}

function getMetricValue(row, index) {
	if (!row) return null;
	return parseNumber(row.values[index]);
}

function buildRecommendation(
	summary,
	volatilityRow,
	drawdownRow,
	stdDevRow,
) {
	const legs = summary.legs;
	if (!legs.length) {
		return null;
	}

	const scores = legs.map((leg, index) => ({
		leg,
		index,
		volatility: getMetricValue(volatilityRow, index),
		drawdown: getMetricValue(drawdownRow, index),
		stdDev: getMetricValue(stdDevRow, index),
	}));

	const best = scores.reduce((currentBest, candidate) => {
		if (!currentBest) return candidate;

		const compareOrder = ["volatility", "drawdown", "stdDev"];

		for (const metric of compareOrder) {
			const a = candidate[metric];
			const b = currentBest[metric];
			const aValue = a === null ? Infinity : a;
			const bValue = b === null ? Infinity : b;
			if (aValue < bValue - EPSILON) {
				return candidate;
			}
			if (aValue > bValue + EPSILON) {
				return currentBest;
			}
		}

		return currentBest;
	}, null);

	if (!best) {
		return null;
	}

	const details = [
		volatilityRow ? `vol ${volatilityRow.values[best.index]}` : null,
		drawdownRow ? `drawdown ${drawdownRow.values[best.index]}` : null,
		stdDevRow ? `std ${stdDevRow.values[best.index]}` : null,
	]
		.filter(Boolean)
		.join(", ");

	return `Lending recommendation: ${best.leg} (${details})`;
}

function generateMarkdownForPool(poolName, summary) {
	let markdown = `### ${poolName}\n\n`;

	const headerRow = ["Metric", ...summary.legs];
	const separatorRow = ["---", ...summary.legs.map(() => "---")];
	markdown += `| ${headerRow.join(" | ")} |\n`;
	markdown += `| ${separatorRow.join(" | ")} |\n`;

	for (const row of summary.rows) {
		markdown += `| ${row.metric} | ${row.values.join(" | ")} |\n`;
	}

	const highlights = buildHighlights(summary);
	if (highlights.length > 0) {
		markdown += "\nHighlights:\n";
		for (const highlight of highlights) {
			markdown += `- ${highlight}\n`;
		}
	}

	return `${markdown}\n`;
}

function generateComparisonTable(poolType, pools) {
	const outputFile = path.join(
		OUTPUT_ROOT,
		`leg-comparison-${poolType}.md`,
	);

	let markdown = `# Leg Sensitivity Comparison - ${poolType}\n\n`;

	for (const pool of pools) {
		const summary = loadSummary(poolType, pool);
		if (!summary) {
			console.log(
				`Summary CSV missing for ${pool} (${poolType}), skipping...`,
			);
			continue;
		}
		markdown += generateMarkdownForPool(pool, summary);
	}

	fs.writeFileSync(outputFile, markdown.trimEnd() + "\n");
	console.log(`Generated comparison table: ${outputFile}`);
}

(function main() {
	ensureDir(OUTPUT_ROOT);

	const poolTypes = discoverPoolTypes();
	for (const poolType of poolTypes) {
		const pools = discoverPools(poolType);
		if (pools.length === 0) {
			continue;
		}
		console.log(`\nBuilding comparison tables for ${poolType} pools...`);
		generateComparisonTable(poolType, pools);
	}

	console.log("\nLeg sensitivity comparison tables generated!");
})();
