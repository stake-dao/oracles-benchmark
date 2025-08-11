/**
 * Oracle Comparison CSV Generator
 *
 * This script generates CSV files comparing StakeDAO and Curve oracle implementations
 * for various Curve pools. It produces two types of files:
 *
 * 1. Detailed Comparison CSV (oracle-comparison-{poolType}-{pool}.csv):
 *    - timestamp: ISO timestamp of the measurement
 *    - block_number: Ethereum block number
 *    - stakeDao_price: Price from StakeDAO oracle (LP/Loan at 1e18 scale)
 *    - curve_price: Price from Curve oracle (LP/Loan at 1e18 scale)
 *    - price_difference: Absolute difference (Curve - StakeDAO)
 *    - price_difference_percent: Percentage difference ((Curve - StakeDAO) / StakeDAO * 100)
 *
 * 2. Statistical Summary CSV (oracle-summary-{poolType}-{pool}.csv):
 *    - pool: Pool name (e.g., cbBTCwBTC, ETHstETH, USDCUSDT)
 *    - total_data_points: Number of data points compared
 *
 *    Basic Statistics:
 *    - avg_price_diff: Average absolute price difference
 *    - avg_price_diff_percent: Average percentage difference
 *    - max_price_diff: Maximum price difference
 *    - min_price_diff: Minimum price difference
 *    - max_price_diff_percent: Maximum percentage difference
 *    - min_price_diff_percent: Minimum percentage difference
 *    - std_dev_price_diff: Standard deviation of price differences
 *
 *    Correlation Analysis:
 *    - correlation: Pearson correlation coefficient between oracles (-1 to +1)
 *      * 1.0 = perfect positive correlation
 *      * 0.0 = no correlation
 *      * -1.0 = perfect negative correlation
 *
 *    Volatility Metrics:
 *    - stakeDao_volatility: Annualized volatility of StakeDAO oracle returns
 *    - curve_volatility: Annualized volatility of Curve oracle returns
 *    - tracking_error: Standard deviation of price differences (consistency measure)
 *
 *    Risk-Adjusted Performance:
 *    - information_ratio: Mean excess return / tracking error
 *      * Positive = StakeDAO outperforms Curve on risk-adjusted basis
 *      * Negative = Curve outperforms StakeDAO
 *    - stakeDao_sharpe: Sharpe ratio for StakeDAO oracle (return per unit of risk)
 *    - max_drawdown: Largest peak-to-trough decline in StakeDAO prices
 *
 *    Robust Statistics:
 *    - median_absolute_deviation: Median absolute deviation (robust alternative to std dev)
 *
 *    Relative Performance:
 *    - stakeDao_higher_percent: % of time StakeDAO price > Curve price
 *    - stakeDao_lower_percent: % of time StakeDAO price < Curve price
 *    - stakeDao_equal_percent: % of time prices are equal
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

function generateCSV(stakeDaoData, curveData, poolName, poolType) {
	// Create a map for easy lookup by timestamp
	const curveMap = new Map(curveData.map((d) => [d.timestamp, d.price]));

	// Generate CSV content
	let csv =
		"timestamp,block_number,stakeDao_price,curve_price,price_difference,price_difference_percent\n";

	for (const sd of stakeDaoData) {
		const curvePrice = curveMap.get(sd.timestamp) || "";
		const priceDiff = curvePrice ? curvePrice - sd.price : "";
		const priceDiffPercent = curvePrice
			? ((priceDiff / sd.price) * 100).toFixed(4)
			: "";

		csv += `${sd.timestamp},${sd.blockNumber},${sd.price.toFixed(6)},${curvePrice ? curvePrice.toFixed(6) : ""},${priceDiff ? priceDiff.toFixed(6) : ""},${priceDiffPercent}\n`;
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
		`Generated CSV for ${poolName} (${poolType}): ${stakeDaoData.length} data points`,
	);
}

function generateSummaryCSV(stakeDaoData, curveData, poolName, poolType) {
	// Calculate statistics
	const curveMap = new Map(curveData.map((d) => [d.timestamp, d.price]));
	const comparisons = stakeDaoData
		.map((sd) => {
			const curvePrice = curveMap.get(sd.timestamp);
			if (!curvePrice) return null;

			const priceDiff = curvePrice - sd.price;
			const priceDiffPercent = (priceDiff / sd.price) * 100;

			return {
				timestamp: sd.timestamp,
				stakeDaoPrice: sd.price,
				curvePrice: curvePrice,
				priceDiff: priceDiff,
				priceDiffPercent: priceDiffPercent,
			};
		})
		.filter((c) => c !== null);

	if (comparisons.length === 0) {
		console.log(`No matching data points for ${poolName} (${poolType})`);
		return;
	}

	// Calculate basic statistics
	const priceDiffs = comparisons.map((c) => c.priceDiff);
	const priceDiffPercents = comparisons.map((c) => c.priceDiffPercent);
	const stakeDaoPrices = comparisons.map((c) => c.stakeDaoPrice);
	const curvePrices = comparisons.map((c) => c.curvePrice);

	// Calculate correlation coefficient
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

	// Calculate volatility (standard deviation of returns)
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

	const stakeDaoVolatility =
		stakeDaoReturns.length > 0
			? Math.sqrt(
					stakeDaoReturns.reduce((sum, r) => sum + r ** 2, 0) /
						stakeDaoReturns.length,
				) * Math.sqrt(365 * 24 * 4) // Annualized (assuming 4-hour intervals)
			: 0;
	const curveVolatility =
		curveReturns.length > 0
			? Math.sqrt(
					curveReturns.reduce((sum, r) => sum + r ** 2, 0) /
						curveReturns.length,
				) * Math.sqrt(365 * 24 * 4)
			: 0;

	// Calculate tracking error (standard deviation of price differences)
	const trackingError = Math.sqrt(
		priceDiffs.reduce((sum, diff) => sum + diff ** 2, 0) / priceDiffs.length,
	);

	// Calculate maximum drawdown (largest peak-to-trough decline)
	let maxDrawdown = 0;
	let peak = stakeDaoPrices[0];
	for (const price of stakeDaoPrices) {
		if (price > peak) peak = price;
		const drawdown = (peak - price) / peak;
		if (drawdown > maxDrawdown) maxDrawdown = drawdown;
	}

	// Calculate information ratio (mean excess return / tracking error)
	const meanExcessReturn =
		priceDiffs.reduce((a, b) => a + b, 0) / priceDiffs.length;
	const informationRatio =
		trackingError !== 0 ? meanExcessReturn / trackingError : 0;

	// Calculate Sharpe ratio (assuming risk-free rate of 0 for simplicity)
	const stakeDaoSharpe =
		stakeDaoVolatility !== 0
			? stakeDaoReturns.reduce((a, b) => a + b, 0) /
				stakeDaoReturns.length /
				stakeDaoVolatility
			: 0;

	// Calculate median absolute deviation (MAD)
	const medianPriceDiff = priceDiffs.sort((a, b) => a - b)[
		Math.floor(priceDiffs.length / 2)
	];
	const mad =
		priceDiffs.reduce(
			(sum, diff) => sum + Math.abs(diff - medianPriceDiff),
			0,
		) / priceDiffs.length;

	// Calculate percentage of time StakeDAO is higher/lower
	const stakeDaoHigher = comparisons.filter(
		(c) => c.stakeDaoPrice > c.curvePrice,
	).length;
	const stakeDaoLower = comparisons.filter(
		(c) => c.stakeDaoPrice < c.curvePrice,
	).length;
	const stakeDaoEqual = comparisons.filter(
		(c) => c.stakeDaoPrice === c.curvePrice,
	).length;

	const stats = {
		pool: poolName,
		poolType: poolType,
		totalDataPoints: comparisons.length,
		avgPriceDiff: priceDiffs.reduce((a, b) => a + b, 0) / priceDiffs.length,
		avgPriceDiffPercent:
			priceDiffPercents.reduce((a, b) => a + b, 0) / priceDiffPercents.length,
		maxPriceDiff: Math.max(...priceDiffs),
		minPriceDiff: Math.min(...priceDiffs),
		maxPriceDiffPercent: Math.max(...priceDiffPercents),
		minPriceDiffPercent: Math.min(...priceDiffPercents),
		stdDevPriceDiff: Math.sqrt(
			priceDiffs.reduce(
				(sq, n) =>
					sq +
					(n - priceDiffs.reduce((a, b) => a + b, 0) / priceDiffs.length) ** 2,
				0,
			) / priceDiffs.length,
		),
		stdDevPriceDiffPercent: Math.sqrt(
			priceDiffPercents.reduce(
				(sq, n) =>
					sq +
					(n -
						priceDiffPercents.reduce((a, b) => a + b, 0) /
							priceDiffPercents.length) **
						2,
				0,
			) / priceDiffPercents.length,
		),
		correlation: correlation,
		stakeDaoVolatility: stakeDaoVolatility,
		curveVolatility: curveVolatility,
		trackingError: trackingError,
		maxDrawdown: maxDrawdown,
		informationRatio: informationRatio,
		stakeDaoSharpe: stakeDaoSharpe,
		medianAbsoluteDeviation: mad,
		stakeDaoHigherPercent: (stakeDaoHigher / comparisons.length) * 100,
		stakeDaoLowerPercent: (stakeDaoLower / comparisons.length) * 100,
		stakeDaoEqualPercent: (stakeDaoEqual / comparisons.length) * 100,
	};

	// Generate summary CSV with expanded metrics
	let summaryCsv =
		"pool,pool_type,total_data_points,avg_price_diff,avg_price_diff_percent,max_price_diff,min_price_diff,max_price_diff_percent,min_price_diff_percent,std_dev_price_diff,std_dev_price_diff_percent,correlation,stakeDao_volatility,curve_volatility,tracking_error,max_drawdown,information_ratio,stakeDao_sharpe,median_absolute_deviation,stakeDao_higher_percent,stakeDao_lower_percent,stakeDao_equal_percent\n";
	summaryCsv += `${stats.pool},${stats.poolType},${stats.totalDataPoints},${stats.avgPriceDiff.toFixed(6)},${stats.avgPriceDiffPercent.toFixed(4)},${stats.maxPriceDiff.toFixed(6)},${stats.minPriceDiff.toFixed(6)},${stats.maxPriceDiffPercent.toFixed(4)},${stats.minPriceDiffPercent.toFixed(4)},${stats.stdDevPriceDiff.toFixed(6)},${stats.stdDevPriceDiffPercent.toFixed(4)},${stats.correlation.toFixed(6)},${stats.stakeDaoVolatility.toFixed(6)},${stats.curveVolatility.toFixed(6)},${stats.trackingError.toFixed(6)},${stats.maxDrawdown.toFixed(6)},${stats.informationRatio.toFixed(6)},${stats.stakeDaoSharpe.toFixed(6)},${stats.medianAbsoluteDeviation.toFixed(6)},${stats.stakeDaoHigherPercent.toFixed(2)},${stats.stakeDaoLowerPercent.toFixed(2)},${stats.stakeDaoEqualPercent.toFixed(2)}\n`;

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

		generateCSV(stakeDaoData, curveData, poolName, poolType);
		generateSummaryCSV(stakeDaoData, curveData, poolName, poolType);
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
