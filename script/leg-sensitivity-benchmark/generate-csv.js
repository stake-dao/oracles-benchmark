const fs = require("node:fs");
const path = require("node:path");

const DATA_ROOT = path.join("data", "leg-sensitivity-benchmark");
const OUTPUT_ROOT = path.join("assets", "leg-sensitivity-benchmark");
const CSV_DIR = path.join(OUTPUT_ROOT, "csv");

function ensureDir(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

function loadLegData(filePath) {
	const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return raw
		.filter((entry) => entry.price > 0)
		.map((entry) => ({
			timestamp: new Date(entry.timestamp * 1000).toISOString(),
			blockNumber: entry.block_number,
			price: Number.parseFloat(entry.price) / 1e18,
		}));
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

function discoverLegFiles(poolType, poolName) {
	const poolPath = path.join(DATA_ROOT, poolType, poolName);
	if (!fs.existsSync(poolPath)) {
		return [];
	}

	return fs
		.readdirSync(poolPath, { withFileTypes: true })
		.filter((dirent) => dirent.isFile() && dirent.name.endsWith(".json"))
		.filter((dirent) => dirent.name.includes("coins"))
		.map((dirent) => {
			const label = dirent.name.replace(".json", "").split("coins").pop();
			return {
				label: `coins${label}`,
				filePath: path.join(poolPath, dirent.name),
			};
		})
		.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
}

function formatNumber(value, decimals = 6) {
	return typeof value === "number" && Number.isFinite(value)
		? value.toFixed(decimals)
		: "";
}

function formatPercent(value, decimals = 4) {
	return typeof value === "number" && Number.isFinite(value)
		? `${value.toFixed(decimals)}%`
		: "";
}

function computeStats(entries, baselineMap) {
	if (!entries.length) {
		return null;
	}

	const prices = entries.map((entry) => entry.price);
	const totalDataPoints = entries.length;
	const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
	const minPrice = Math.min(...prices);
	const maxPrice = Math.max(...prices);
	const stdDevPrice = Math.sqrt(
		prices.reduce((sum, price) => sum + (price - avgPrice) ** 2, 0) / prices.length,
	);

	const returns = [];
	for (let i = 1; i < prices.length; i += 1) {
		if (prices[i - 1] !== 0) {
			returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
		}
	}
	const annualizationFactor = Math.sqrt(365 * 24 * 4);
	const volatility =
		returns.length > 0
			? Math.sqrt(
					returns.reduce((sum, r) => sum + r ** 2, 0) / returns.length,
				) * annualizationFactor
			: 0;

	let peak = prices[0];
	let maxDrawdown = 0;
	for (const price of prices) {
		if (price > peak) peak = price;
		if (peak !== 0) {
			const drawdown = (peak - price) / peak;
			maxDrawdown = Math.max(maxDrawdown, drawdown);
		}
	}

	let avgAbsDiffBaseline = 0;
	let avgPctDiffBaseline = 0;
	let avgSignedDiffBaseline = 0;
	let avgSignedPctDiffBaseline = 0;
	let trackingErrorBaseline = 0;
	let medianAbsDiffBaseline = 0;

	if (baselineMap) {
		const absDiffs = [];
		const signedDiffs = [];
		const pctDiffs = [];
		const signedPctDiffs = [];

		for (const entry of entries) {
			const baselinePrice = baselineMap.get(entry.timestamp);
			if (typeof baselinePrice === "number") {
				const diff = entry.price - baselinePrice;
				const absDiff = Math.abs(diff);
				absDiffs.push(absDiff);
				signedDiffs.push(diff);
				if (baselinePrice !== 0) {
					const pctDiff = (diff / baselinePrice) * 100;
					pctDiffs.push(Math.abs(pctDiff));
					signedPctDiffs.push(pctDiff);
				}
			}
		}
		if (absDiffs.length > 0) {
			avgAbsDiffBaseline =
				absDiffs.reduce((sum, value) => sum + value, 0) / absDiffs.length;
		}
		if (signedDiffs.length > 0) {
			avgSignedDiffBaseline =
				signedDiffs.reduce((sum, value) => sum + value, 0) / signedDiffs.length;
			trackingErrorBaseline = Math.sqrt(
				signedDiffs.reduce((sum, value) => sum + value ** 2, 0) /
					signedDiffs.length,
			);
			const sortedAbs = [...absDiffs].sort((a, b) => a - b);
			const mid = Math.floor(sortedAbs.length / 2);
			if (sortedAbs.length % 2 === 0) {
				medianAbsDiffBaseline = (sortedAbs[mid - 1] + sortedAbs[mid]) / 2;
			} else {
				medianAbsDiffBaseline = sortedAbs[mid];
			}
		}

		if (pctDiffs.length > 0) {
			avgPctDiffBaseline =
				pctDiffs.reduce((sum, value) => sum + value, 0) / pctDiffs.length;
		}
		if (signedPctDiffs.length > 0) {
			avgSignedPctDiffBaseline =
				signedPctDiffs.reduce((sum, value) => sum + value, 0) /
				signedPctDiffs.length;
		}
	}

	return {
		totalDataPoints,
		avgPrice,
		minPrice,
		maxPrice,
		stdDevPrice,
		volatilityPercent: volatility * 100,
		maxDrawdownPercent: maxDrawdown * 100,
		avgAbsDiffBaseline,
		avgPctDiffBaseline,
		avgSignedDiffBaseline,
		avgSignedPctDiffBaseline,
		trackingErrorBaseline,
		medianAbsDiffBaseline,
	};
}

function writeDetailedCSV(poolType, poolName, timestamps, legLabels, entryMaps, baselineLabel) {
	const filename = path.join(
		CSV_DIR,
		`leg-data-${poolType}-${poolName.replace(/[\\/\\\\]/g, "")}.csv`,
	);

	const header = ["timestamp", "block_number", ...legLabels.map((label) => `${label}_price`)];
	let csv = `${header.join(",")}\n`;

	for (const timestamp of timestamps) {
		const baselineEntry = entryMaps.get(baselineLabel).get(timestamp);
		const blockNumber = baselineEntry?.blockNumber ?? "";
		const prices = legLabels.map((label) => {
			const entry = entryMaps.get(label).get(timestamp);
			return entry ? formatNumber(entry.price) : "";
		});
		csv += `${timestamp},${blockNumber},${prices.join(",")}\n`;
	}

	fs.writeFileSync(filename, csv);
}

function writeSummaryCSV(poolType, poolName, legLabels, statsByLeg, baselineLabel) {
	const filename = path.join(
		CSV_DIR,
		`leg-summary-${poolType}-${poolName.replace(/[\\/\\\\]/g, "")}.csv`,
	);

	const metrics = [
		{ key: "totalDataPoints", label: "Total Data Points" },
		{ key: "avgPrice", label: "Average Price", formatter: (value) => formatNumber(value) },
		{ key: "minPrice", label: "Min Price", formatter: (value) => formatNumber(value) },
		{ key: "maxPrice", label: "Max Price", formatter: (value) => formatNumber(value) },
		{
			key: "stdDevPrice",
			label: "Std Dev Price",
			formatter: (value) => formatNumber(value),
		},
		{
			key: "volatilityPercent",
			label: "Volatility (%)",
			formatter: (value) => formatPercent(value),
		},
		{
			key: "maxDrawdownPercent",
			label: "Max Drawdown (%)",
			formatter: (value) => formatPercent(value),
		},
	];

	const header = ["metric", ...legLabels];
	let csv = `${header.join(",")}\n`;

	for (const metric of metrics) {
		const row = [metric.label];
		for (const label of legLabels) {
			const stats = statsByLeg.get(label);
			const formatter = metric.formatter || ((value) => (value ?? "").toString());
			row.push(stats ? formatter(stats[metric.key]) : "N/A");
		}
		csv += `${row.join(",")}\n`;
	}

	fs.writeFileSync(filename, csv);
}

function processPool(poolType, poolName) {
	const legFiles = discoverLegFiles(poolType, poolName);
	if (legFiles.length === 0) {
		console.log(
			`No leg configuration data for ${poolName} (${poolType}), skipping...`,
		);
		return;
	}

	const legDatasets = legFiles.map((leg) => ({
		label: leg.label,
		entries: loadLegData(leg.filePath),
	}));

	const legLabels = legDatasets.map((dataset) => dataset.label);
	const baselineLabel = legLabels[0];
	const entryMaps = new Map(
		legDatasets.map((dataset) => [
			dataset.label,
			new Map(dataset.entries.map((entry) => [entry.timestamp, entry])),
		]),
	);

	const timestamps = Array.from(
		new Set(
			legDatasets
				.map((dataset) => dataset.entries.map((entry) => entry.timestamp))
				.flat(),
		),
	).sort();

	writeDetailedCSV(poolType, poolName, timestamps, legLabels, entryMaps, baselineLabel);

	const baselineMap = entryMaps.get(baselineLabel);
	const statsByLeg = new Map();

	for (const dataset of legDatasets) {
		const stats = computeStats(dataset.entries, baselineMap);
		statsByLeg.set(dataset.label, stats);
	}

	writeSummaryCSV(poolType, poolName, legLabels, statsByLeg, baselineLabel);

	console.log(
		`Generated leg sensitivity CSVs for ${poolName} (${poolType}) with ${legLabels.length} legs`,
	);
}

(function main() {
	ensureDir(OUTPUT_ROOT);
	ensureDir(CSV_DIR);

	const poolTypes = discoverPoolTypes();
	for (const poolType of poolTypes) {
		console.log(`\nProcessing ${poolType} pools...`);
		const pools = discoverPools(poolType);
		for (const pool of pools) {
			processPool(poolType, pool);
		}
	}

	console.log("\nLeg sensitivity CSV generation completed!");
})();
