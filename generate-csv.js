/**
 * Oracle Comparison CSV Generator
 *
 * This script generates CSV files comparing StakeDAO and Curve oracle implementations
 * for various Curve pools. It produces two types of files:
 *
 * 1. Detailed Comparison CSV (oracle-comparison-{poolType}-{pool}.csv):
 *    - timestamp: ISO timestamp of the measurement
 *    - block_number: Ethereum block number
 *    - stakeDao_price: Price from StakeDAO oracle v1 (LP/Loan at 1e18 scale)
 *    - stakeDao_v2_price: Price from StakeDAO oracle v2 (when available)
 *    - curve_price: Price from Curve oracle (LP/Loan at 1e18 scale)
 *    - price_difference: Absolute difference (Curve - StakeDAO v1)
 *    - price_difference_percent: Percentage difference ((Curve - StakeDAO v1) / StakeDAO v1 * 100)
 *    - price_difference_v2 / price_difference_percent_v2: Same metrics for StakeDAO v2
 *
 * 2. Statistical Summary CSV (oracle-summary-{poolType}-{pool}.csv):
 *    - pool: Pool name (e.g., cbBTCwBTC, ETHstETH, USDCUSDT)
 *    - total_data_points(_v2): Number of data points compared for v1 (and v2)
 *
 *    Basic Statistics:
 *    - avg_price_diff(_v2): Average absolute price difference
 *    - avg_price_diff_percent(_v2): Average percentage difference
 *    - max_price_diff(_v2) / min_price_diff(_v2): Extremes of price differences
 *    - max_price_diff_percent(_v2) / min_price_diff_percent(_v2): Extremes in percentage terms
 *    - std_dev_price_diff(_v2): Standard deviation of price differences
 *
 *    Correlation Analysis:
 *    - correlation(_v2): Pearson correlation coefficient between oracles (-1 to +1)
 *      * 1.0 = perfect positive correlation
 *      * 0.0 = no correlation
 *      * -1.0 = perfect negative correlation
 *
 *    Volatility Metrics:
 *    - stakeDao_volatility(_v2): Annualized volatility of StakeDAO oracle returns
 *    - curve_volatility(_v2): Annualized volatility of Curve oracle returns (per dataset)
 *    - tracking_error(_v2): Standard deviation of price differences (consistency measure)
 *
 *    Risk-Adjusted Performance:
 *    - information_ratio(_v2): Mean excess return / tracking error
 *      * Positive = StakeDAO outperforms Curve on risk-adjusted basis
 *      * Negative = Curve outperforms StakeDAO
 *    - stakeDao_sharpe(_v2): Sharpe ratio for StakeDAO oracle (return per unit of risk)
 *    - max_drawdown(_v2): Largest peak-to-trough decline in StakeDAO prices
 *
 *    Robust Statistics:
 *    - median_absolute_deviation(_v2): Median absolute deviation (robust alternative to std dev)
 *
 *    Relative Performance:
 *    - stakeDao_higher_percent(_v2): % of time StakeDAO price > Curve price
 *    - stakeDao_lower_percent(_v2): % of time StakeDAO price < Curve price
 *    - stakeDao_equal_percent(_v2): % of time prices are equal
 */

const fs = require("node:fs");
const path = require("node:path");

function loadOracleData(filePath) {
	const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return data
		.filter((entry) => entry.price > 0)
		.map((entry) => ({
			timestamp: new Date(entry.timestamp * 1000).toISOString(),
			blockNumber: entry.block_number,
			price: Number.parseFloat(entry.price) / 1e18, // Convert to readable price
		}));
}

function generateCSV(stakeDaoData, curveData, poolName, poolType, stakeDaoV2Data = []) {
	// Create maps for easy lookup by timestamp
	const curveMap = new Map(curveData.map((d) => [d.timestamp, d.price]));
	const stakeDaoMap = new Map(stakeDaoData.map((d) => [d.timestamp, d]));
	const stakeDaoV2Map = new Map(stakeDaoV2Data.map((d) => [d.timestamp, d]));

	// Build a unified, chronologically sorted timestamp list across all sources
	const timestampSet = new Set();
	for (const entry of [...stakeDaoData, ...stakeDaoV2Data, ...curveData]) {
		timestampSet.add(entry.timestamp);
	}
	const timestamps = Array.from(timestampSet).sort();

	const formatNumber = (value, decimals = 6) =>
		typeof value === "number" ? value.toFixed(decimals) : "";

	// Generate CSV content
	let csv =
		"timestamp,block_number,stakeDao_price,stakeDao_v2_price,curve_price,price_difference,price_difference_percent,price_difference_v2,price_difference_percent_v2\n";

	for (const timestamp of timestamps) {
		const stakeDaoEntry = stakeDaoMap.get(timestamp);
		const stakeDaoV2Entry = stakeDaoV2Map.get(timestamp);
		const curvePrice = curveMap.get(timestamp);

		const blockNumber =
			stakeDaoEntry?.blockNumber ?? stakeDaoV2Entry?.blockNumber ?? "";

		const priceDiff =
			stakeDaoEntry && typeof curvePrice === "number"
				? curvePrice - stakeDaoEntry.price
				: null;
		const priceDiffPercent =
			priceDiff !== null ? (priceDiff / stakeDaoEntry.price) * 100 : null;

		const priceDiffV2 =
			stakeDaoV2Entry && typeof curvePrice === "number"
				? curvePrice - stakeDaoV2Entry.price
				: null;
		const priceDiffPercentV2 =
			priceDiffV2 !== null ? (priceDiffV2 / stakeDaoV2Entry.price) * 100 : null;

		csv += `${timestamp},${blockNumber},${stakeDaoEntry ? formatNumber(stakeDaoEntry.price) : ""},${stakeDaoV2Entry ? formatNumber(stakeDaoV2Entry.price) : ""},${typeof curvePrice === "number" ? formatNumber(curvePrice) : ""},${priceDiff !== null ? formatNumber(priceDiff) : ""},${priceDiffPercent !== null ? priceDiffPercent.toFixed(4) : ""},${priceDiffV2 !== null ? formatNumber(priceDiffV2) : ""},${priceDiffPercentV2 !== null ? priceDiffPercentV2.toFixed(4) : ""}\n`;
	}

	// Ensure directory exists
	const dir = "assets/csv";
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	// Create filename with pool type prefix to avoid conflicts
	const filename = `oracle-comparison-${poolType}-${poolName.replace(/[\/\\]/g, "")}.csv`;
	fs.writeFileSync(`${dir}/${filename}`, csv);
	console.log(
		`Generated CSV for ${poolName} (${poolType}): ${timestamps.length} data points (combined)`,
	);
}

function calculateStatistics(stakeDaoData, curveMap) {
	const comparisons = stakeDaoData
		.map((sd) => {
			const curvePrice = curveMap.get(sd.timestamp);
			if (typeof curvePrice !== "number") return null;

			const priceDiff = curvePrice - sd.price;
			const priceDiffPercent = (priceDiff / sd.price) * 100;

			return {
				timestamp: sd.timestamp,
				stakeDaoPrice: sd.price,
				curvePrice,
				priceDiff,
				priceDiffPercent,
			};
		})
		.filter((c) => c !== null);

	if (comparisons.length === 0) {
		return null;
	}

	const priceDiffs = comparisons.map((c) => c.priceDiff);
	const priceDiffPercents = comparisons.map((c) => c.priceDiffPercent);
	const stakeDaoPrices = comparisons.map((c) => c.stakeDaoPrice);
	const curvePrices = comparisons.map((c) => c.curvePrice);

	const meanStakeDao =
		stakeDaoPrices.reduce((a, b) => a + b, 0) / stakeDaoPrices.length;
	const meanCurve = curvePrices.reduce((a, b) => a + b, 0) / curvePrices.length;

	const numerator = comparisons.reduce(
		(sum, c) =>
			sum + (c.stakeDaoPrice - meanStakeDao) * (c.curvePrice - meanCurve),
		0,
	);
	const denominatorStakeDao = Math.sqrt(
		comparisons.reduce(
			(sum, c) => sum + (c.stakeDaoPrice - meanStakeDao) ** 2,
			0,
		),
	);
	const denominatorCurve = Math.sqrt(
		comparisons.reduce((sum, c) => sum + (c.curvePrice - meanCurve) ** 2, 0),
	);

	const correlation =
		denominatorStakeDao * denominatorCurve !== 0
			? numerator / (denominatorStakeDao * denominatorCurve)
			: 0;

	const stakeDaoReturns = [];
	const curveReturns = [];
	for (let i = 1; i < stakeDaoPrices.length; i++) {
		stakeDaoReturns.push(
			(stakeDaoPrices[i] - stakeDaoPrices[i - 1]) / stakeDaoPrices[i - 1],
		);
		curveReturns.push(
			(curvePrices[i] - curvePrices[i - 1]) / curvePrices[i - 1],
		);
	}

	const annualizationFactor = Math.sqrt(365 * 24 * 4); // Approx. 4-hour sampling
	const stakeDaoVolatility =
		stakeDaoReturns.length > 0
			? Math.sqrt(
					stakeDaoReturns.reduce((sum, r) => sum + r ** 2, 0) /
						stakeDaoReturns.length,
				) * annualizationFactor
			: 0;
	const curveVolatility =
		curveReturns.length > 0
			? Math.sqrt(
					curveReturns.reduce((sum, r) => sum + r ** 2, 0) /
						curveReturns.length,
				) * annualizationFactor
			: 0;

	const meanPriceDiff =
		priceDiffs.reduce((a, b) => a + b, 0) / priceDiffs.length;
	const meanPriceDiffPercent =
		priceDiffPercents.reduce((a, b) => a + b, 0) / priceDiffPercents.length;

	const trackingError = Math.sqrt(
		priceDiffs.reduce((sum, diff) => sum + diff ** 2, 0) / priceDiffs.length,
	);

	let maxDrawdown = 0;
	let peak = stakeDaoPrices[0];
	for (const price of stakeDaoPrices) {
		if (price > peak) peak = price;
		const drawdown = (peak - price) / peak;
		if (drawdown > maxDrawdown) maxDrawdown = drawdown;
	}

	const informationRatio =
		trackingError !== 0 ? meanPriceDiff / trackingError : 0;
	const stakeDaoSharpe =
		stakeDaoVolatility !== 0
			? stakeDaoReturns.reduce((a, b) => a + b, 0) /
				stakeDaoReturns.length /
				stakeDaoVolatility
			: 0;

	const sortedDiffs = [...priceDiffs].sort((a, b) => a - b);
	const medianPriceDiff = sortedDiffs[Math.floor(sortedDiffs.length / 2)];
	const medianAbsoluteDeviation =
		priceDiffs.reduce(
			(sum, diff) => sum + Math.abs(diff - medianPriceDiff),
			0,
		) / priceDiffs.length;

	const stakeDaoHigher = comparisons.filter(
		(c) => c.stakeDaoPrice > c.curvePrice,
	).length;
	const stakeDaoLower = comparisons.filter(
		(c) => c.stakeDaoPrice < c.curvePrice,
	).length;
	const stakeDaoEqual = comparisons.length - stakeDaoHigher - stakeDaoLower;

	return {
		totalDataPoints: comparisons.length,
		avgPriceDiff: meanPriceDiff,
		avgPriceDiffPercent: meanPriceDiffPercent,
		maxPriceDiff: Math.max(...priceDiffs),
		minPriceDiff: Math.min(...priceDiffs),
		maxPriceDiffPercent: Math.max(...priceDiffPercents),
		minPriceDiffPercent: Math.min(...priceDiffPercents),
		stdDevPriceDiff: Math.sqrt(
			priceDiffs.reduce(
				(sq, n) => sq + (n - meanPriceDiff) ** 2,
				0,
			) / priceDiffs.length,
		),
		stdDevPriceDiffPercent: Math.sqrt(
			priceDiffPercents.reduce(
				(sq, n) => sq + (n - meanPriceDiffPercent) ** 2,
				0,
			) / priceDiffPercents.length,
		),
		correlation,
		stakeDaoVolatility,
		curveVolatility,
		trackingError,
		maxDrawdown,
		informationRatio,
		stakeDaoSharpe,
		medianAbsoluteDeviation,
		stakeDaoHigherPercent: (stakeDaoHigher / comparisons.length) * 100,
		stakeDaoLowerPercent: (stakeDaoLower / comparisons.length) * 100,
		stakeDaoEqualPercent: (stakeDaoEqual / comparisons.length) * 100,
	};
}

function generateSummaryCSV(
	stakeDaoData,
	curveData,
	poolName,
	poolType,
	stakeDaoV2Data = [],
) {
	const curveMap = new Map(curveData.map((d) => [d.timestamp, d.price]));

	const statsV1 = calculateStatistics(stakeDaoData, curveMap);
	if (!statsV1) {
		console.log(`No matching data points for ${poolName} (${poolType})`);
		return;
	}
	const statsV2 =
		stakeDaoV2Data.length > 0
			? calculateStatistics(stakeDaoV2Data, curveMap)
			: null;

	const safeFixed = (value, decimals) =>
		typeof value === "number" ? value.toFixed(decimals) : "";

	const headers = [
		"pool",
		"pool_type",
		"total_data_points",
		"avg_price_diff",
		"avg_price_diff_percent",
		"max_price_diff",
		"min_price_diff",
		"max_price_diff_percent",
		"min_price_diff_percent",
		"std_dev_price_diff",
		"std_dev_price_diff_percent",
		"correlation",
		"stakeDao_volatility",
		"curve_volatility",
		"tracking_error",
		"max_drawdown",
		"information_ratio",
		"stakeDao_sharpe",
		"median_absolute_deviation",
		"stakeDao_higher_percent",
		"stakeDao_lower_percent",
		"stakeDao_equal_percent",
		"total_data_points_v2",
		"avg_price_diff_v2",
		"avg_price_diff_percent_v2",
		"max_price_diff_v2",
		"min_price_diff_v2",
		"max_price_diff_percent_v2",
		"min_price_diff_percent_v2",
		"std_dev_price_diff_v2",
		"std_dev_price_diff_percent_v2",
		"correlation_v2",
		"stakeDao_volatility_v2",
		"curve_volatility_v2",
		"tracking_error_v2",
		"max_drawdown_v2",
		"information_ratio_v2",
		"stakeDao_sharpe_v2",
		"median_absolute_deviation_v2",
		"stakeDao_higher_percent_v2",
		"stakeDao_lower_percent_v2",
		"stakeDao_equal_percent_v2",
	];

	const values = [
		poolName,
		poolType,
		statsV1.totalDataPoints,
		safeFixed(statsV1.avgPriceDiff, 6),
		safeFixed(statsV1.avgPriceDiffPercent, 4),
		safeFixed(statsV1.maxPriceDiff, 6),
		safeFixed(statsV1.minPriceDiff, 6),
		safeFixed(statsV1.maxPriceDiffPercent, 4),
		safeFixed(statsV1.minPriceDiffPercent, 4),
		safeFixed(statsV1.stdDevPriceDiff, 6),
		safeFixed(statsV1.stdDevPriceDiffPercent, 4),
		safeFixed(statsV1.correlation, 6),
		safeFixed(statsV1.stakeDaoVolatility, 6),
		safeFixed(statsV1.curveVolatility, 6),
		safeFixed(statsV1.trackingError, 6),
		safeFixed(statsV1.maxDrawdown, 6),
		safeFixed(statsV1.informationRatio, 6),
		safeFixed(statsV1.stakeDaoSharpe, 6),
		safeFixed(statsV1.medianAbsoluteDeviation, 6),
		safeFixed(statsV1.stakeDaoHigherPercent, 2),
		safeFixed(statsV1.stakeDaoLowerPercent, 2),
		safeFixed(statsV1.stakeDaoEqualPercent, 2),
		statsV2 ? statsV2.totalDataPoints : "",
		statsV2 ? safeFixed(statsV2.avgPriceDiff, 6) : "",
		statsV2 ? safeFixed(statsV2.avgPriceDiffPercent, 4) : "",
		statsV2 ? safeFixed(statsV2.maxPriceDiff, 6) : "",
		statsV2 ? safeFixed(statsV2.minPriceDiff, 6) : "",
		statsV2 ? safeFixed(statsV2.maxPriceDiffPercent, 4) : "",
		statsV2 ? safeFixed(statsV2.minPriceDiffPercent, 4) : "",
		statsV2 ? safeFixed(statsV2.stdDevPriceDiff, 6) : "",
		statsV2 ? safeFixed(statsV2.stdDevPriceDiffPercent, 4) : "",
		statsV2 ? safeFixed(statsV2.correlation, 6) : "",
		statsV2 ? safeFixed(statsV2.stakeDaoVolatility, 6) : "",
		statsV2 ? safeFixed(statsV2.curveVolatility, 6) : "",
		statsV2 ? safeFixed(statsV2.trackingError, 6) : "",
		statsV2 ? safeFixed(statsV2.maxDrawdown, 6) : "",
		statsV2 ? safeFixed(statsV2.informationRatio, 6) : "",
		statsV2 ? safeFixed(statsV2.stakeDaoSharpe, 6) : "",
		statsV2 ? safeFixed(statsV2.medianAbsoluteDeviation, 6) : "",
		statsV2 ? safeFixed(statsV2.stakeDaoHigherPercent, 2) : "",
		statsV2 ? safeFixed(statsV2.stakeDaoLowerPercent, 2) : "",
		statsV2 ? safeFixed(statsV2.stakeDaoEqualPercent, 2) : "",
	];

	const summaryCsv = `${headers.join(",")}\n${values.join(",")}\n`;

	// Ensure directory exists
	const dir = "assets/csv";
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	// Create filename with pool type prefix to avoid conflicts
	const filename = `oracle-summary-${poolType}-${poolName.replace(/[\/\\]/g, "")}.csv`;
	fs.writeFileSync(`${dir}/${filename}`, summaryCsv);
	console.log(`Generated summary CSV for ${poolName} (${poolType})`);
}

function discoverPools(poolType) {
	const poolTypePath = path.join("data", poolType);

	// Check if directory exists
	if (!fs.existsSync(poolTypePath)) {
		console.log(`Directory ${poolTypePath} does not exist, skipping...`);
		return [];
	}

	// Get all subdirectories (pools)
	const poolDirs = fs
		.readdirSync(poolTypePath, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	console.log(
		`Found ${poolDirs.length} pools in ${poolType}: ${poolDirs.join(", ")}`,
	);
	return poolDirs;
}

function processPool(poolName, poolType) {
	const poolPath = path.join("data", poolType, poolName);

	// Define file paths based on pool type
	const curveFile = path.join(poolPath, `curve-${poolType}.json`);
	const sdFile = path.join(poolPath, `sd-${poolType}.json`);
	const sdV2File = path.join(poolPath, `sd-${poolType}-v2.json`);

	// Check if both files exist
	if (!fs.existsSync(curveFile)) {
		console.log(
			`Warning: ${curveFile} does not exist, skipping pool ${poolName}`,
		);
		return;
	}

	if (!fs.existsSync(sdFile)) {
		console.log(`Warning: ${sdFile} does not exist, skipping pool ${poolName}`);
		return;
	}

	try {
		const stakeDaoData = loadOracleData(sdFile);
		const curveData = loadOracleData(curveFile);
		const stakeDaoV2Data = fs.existsSync(sdV2File)
			? loadOracleData(sdV2File)
			: [];

		generateCSV(stakeDaoData, curveData, poolName, poolType, stakeDaoV2Data);
		generateSummaryCSV(
			stakeDaoData,
			curveData,
			poolName,
			poolType,
			stakeDaoV2Data,
		);
		console.log(`Generated CSV files for ${poolName} (${poolType})`);
	} catch (error) {
		console.error(
			`Error processing pool ${poolName} (${poolType}):`,
			error.message,
		);
	}
}

(function main() {
	const poolTypes = ["cryptoswap", "stableswap"];

	// Ensure assets/csv directory exists
	const csvDir = "assets/csv";
	if (!fs.existsSync(csvDir)) {
		fs.mkdirSync(csvDir, { recursive: true });
	}

	for (const poolType of poolTypes) {
		console.log(`\nProcessing ${poolType} pools...`);
		const pools = discoverPools(poolType);

		for (const pool of pools) {
			processPool(pool, poolType);
		}
	}

	console.log("\nCSV files generated in assets/csv/");
	console.log(
		"- oracle-comparison-{poolType}-{pool}.csv: Detailed comparison data",
	);
	console.log("- oracle-summary-{poolType}-{pool}.csv: Statistical summary");
})();
