/**
 * Oracle Comparison Table Generator
 *
 * Generates comparison tables for both cryptoswap and stableswap pools where:
 * - Rows = Metrics
 * - Columns = Pools (dynamically discovered)
 *
 * This format makes it easier to compare the same metric across different pools
 * and avoids horizontal scrolling issues.
 */

const fs = require("node:fs");
const path = require("node:path");

function parseNumber(value) {
	if (value === undefined || value === null) return null;
	const normalized =
		typeof value === "string" ? value.trim() : `${value ?? ""}`.trim();
	if (normalized === "") return null;
	const num = Number.parseFloat(normalized);
	return Number.isNaN(num) ? null : num;
}

function loadSummaryData(poolName, poolType) {
	const filePath = `assets/csv/oracle-summary-${poolType}-${poolName}.csv`;
	const data = fs.readFileSync(filePath, "utf8");
	const lines = data.split("\n");
	const headers = lines[0].split(",");
	const values = lines[1].split(",");

	const result = {};
	headers.forEach((header, index) => {
		const value = values[index] ?? "";
		result[header.trim()] = value.trim();
	});

	return result;
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

function generateComparisonTable(poolType) {
	const pools = discoverPools(poolType);

	if (pools.length === 0) {
		console.log(`No pools found for ${poolType}, skipping...`);
		return;
	}

	const poolData = {};

	// Load data for each pool
	for (const pool of pools) {
		try {
			poolData[pool] = loadSummaryData(pool, poolType);
		} catch (error) {
			console.error(
				`Error loading data for ${pool} (${poolType}):`,
				error.message,
			);
			poolData[pool] = {};
		}
	}

	const baseMetrics = [
		{ key: "total_data_points", name: "Total Data Points", format: "integer" },
		{ key: "correlation", name: "Correlation", format: "decimal" },
		{
			key: "avg_price_diff_percent",
			name: "Average Price Difference (%)",
			format: "decimal",
		},
		{
			key: "max_price_diff_percent",
			name: "Max Price Difference (%)",
			format: "decimal",
		},
		{
			key: "min_price_diff_percent",
			name: "Min Price Difference (%)",
			format: "decimal",
		},
		{
			key: "std_dev_price_diff",
			name: "Standard Deviation (Absolute)",
			format: "decimal",
		},
		{
			key: "std_dev_price_diff_percent",
			name: "Standard Deviation (%)",
			format: "decimal",
		},
		{ key: "tracking_error", name: "Tracking Error", format: "decimal" },
		{
			key: "stakeDao_volatility",
			name: "StakeDAO Volatility (%)",
			format: "percentage",
		},
		{
			key: "curve_volatility",
			name: "Curve Volatility (%)",
			format: "percentage",
		},
		{ key: "information_ratio", name: "Information Ratio", format: "decimal" },
		{ key: "max_drawdown", name: "Max Drawdown (%)", format: "percentage" },
		{
			key: "median_absolute_deviation",
			name: "Median Absolute Deviation",
			format: "decimal",
		},
		{
			key: "stakeDao_higher_percent",
			name: "StakeDAO Higher (%)",
			format: "percentage",
		},
		{
			key: "stakeDao_lower_percent",
			name: "StakeDAO Lower (%)",
			format: "percentage",
		},
		{
			key: "stakeDao_equal_percent",
			name: "Prices Equal (%)",
			format: "percentage",
		},
	];

	const metricVersions = [
		{ suffix: "", label: "(v1)" },
		{ suffix: "_v2", label: "(v2)" },
	];

	const metrics = [];
	for (const baseMetric of baseMetrics) {
		for (const version of metricVersions) {
			metrics.push({
				key: `${baseMetric.key}${version.suffix}`,
				name: `${baseMetric.name} ${version.label}`.trim(),
				format: baseMetric.format,
			});
		}
	}

	// Generate markdown table
	let markdown = `# Oracle Comparison Summary - ${poolType.charAt(0).toUpperCase() + poolType.slice(1)} Pools\n\n`;

	// Create header row with pool names
	const headerRow = ["Metric"];
	for (const pool of pools) {
		headerRow.push(pool);
	}
	markdown += `| ${headerRow.join(" | ")} |\n`;

	// Create separator row
	const separatorRow = ["--------"];
	for (const pool of pools) {
		separatorRow.push("-".repeat(pool.length));
	}
	markdown += `| ${separatorRow.join(" | ")} |\n`;

	for (const metric of metrics) {
		const row = [metric.name];

		for (const pool of pools) {
			const rawValue = poolData[pool][metric.key];
			const numValue = parseNumber(rawValue);
			if (numValue !== null) {
				let formattedValue;

				switch (metric.format) {
					case "integer":
						formattedValue = Math.round(numValue).toString();
						break;
					case "percentage":
						// Handle values that are already percentages (like stakeDao_higher_percent)
						if (metric.key.includes("percent") && numValue <= 100) {
							formattedValue = `${numValue.toFixed(2)}%`;
						} else {
							formattedValue = `${(numValue * 100).toFixed(2)}%`;
						}
						break;
					case "decimal":
						formattedValue = numValue.toFixed(4);
						break;
					default:
						formattedValue = rawValue ?? "N/A";
				}

				row.push(formattedValue);
			} else {
				row.push("N/A");
			}
		}

		markdown += `| ${row.join(" | ")} |\n`;
	}

	// Add interpretation notes
	markdown += "\n## Interpretation Guide\n\n";
	markdown +=
		"- **Correlation**: 1.0 = perfect correlation, 0.0 = no correlation\n";
	markdown +=
		"- **Price Differences**: Lower is better (closer to Curve's oracle)\n";
	markdown +=
		"- **Tracking Error**: Lower is better (more consistent with Curve)\n";
	markdown += "- **Volatility**: Lower is better (more stable pricing)\n";
	markdown +=
		"- **Information Ratio**: Positive = StakeDAO outperforms, Negative = Curve outperforms\n";
	markdown +=
		"- **Relative Performance**: 50/50 split = no bias, higher % = systematic bias\n\n";
	markdown +=
		"- **Version Labels**: Metrics marked (v1) or (v2) correspond to the respective StakeDAO oracle generation compared against Curve\n\n";

	// Add performance summary
	markdown += "## Performance Summary\n\n";

	const performanceMetrics = [
		{
			key: "correlation",
			label: "Best Correlation (v1)",
			comparator: (a, b) => (a.value > b.value ? a : b),
			formatter: (entry) => `${(entry.value * 100).toFixed(3)}%`,
		},
		{
			key: "correlation_v2",
			label: "Best Correlation (v2)",
			comparator: (a, b) => (a.value > b.value ? a : b),
			formatter: (entry) => `${(entry.value * 100).toFixed(3)}%`,
		},
		{
			key: "tracking_error",
			label: "Lowest Tracking Error (v1)",
			comparator: (a, b) => (a.value < b.value ? a : b),
			formatter: (entry) => entry.value.toFixed(6),
		},
		{
			key: "tracking_error_v2",
			label: "Lowest Tracking Error (v2)",
			comparator: (a, b) => (a.value < b.value ? a : b),
			formatter: (entry) => entry.value.toFixed(6),
		},
	];

	for (const metric of performanceMetrics) {
		const values = pools
			.map((pool) => ({
				pool,
				value: parseNumber(poolData[pool][metric.key]),
			}))
			.filter((entry) => entry.value !== null);

		if (values.length === 0) {
			continue;
		}

		const bestEntry = values.reduce(metric.comparator);
		markdown += `- **${metric.label}**: ${bestEntry.pool} (${metric.formatter(bestEntry)})\n`;
	}

	const balanceMetrics = [
		{
			higherKey: "stakeDao_higher_percent",
			lowerKey: "stakeDao_lower_percent",
			label: "Most Balanced (v1)",
		},
		{
			higherKey: "stakeDao_higher_percent_v2",
			lowerKey: "stakeDao_lower_percent_v2",
			label: "Most Balanced (v2)",
		},
	];

	for (const metric of balanceMetrics) {
		const balances = pools
			.map((pool) => {
				const higher = parseNumber(poolData[pool][metric.higherKey]);
				const lower = parseNumber(poolData[pool][metric.lowerKey]);
				if (higher === null || lower === null) {
					return null;
				}
				return { pool, balance: Math.abs(higher - lower) };
			})
			.filter((entry) => entry !== null);

		if (balances.length === 0) {
			continue;
		}

		const mostBalanced = balances.reduce((a, b) =>
			a.balance < b.balance ? a : b,
		);
		markdown += `- **${metric.label}**: ${mostBalanced.pool} (${mostBalanced.balance.toFixed(2)}% difference)\n`;
	}

	// Save to file
	const filename = `comparison-table-${poolType}.md`;
	fs.writeFileSync(`assets/${filename}`, markdown);
	console.log(`Generated comparison table: assets/${filename}`);

	// Also generate CSV version
	let csv = `metric,${pools.join(",")}\n`;
	for (const metric of metrics) {
		const row = [metric.name];
		for (const pool of pools) {
			const value = poolData[pool][metric.key];
			row.push(value ? value : "N/A");
		}
		csv += `${row.join(",")}\n`;
	}

	// Ensure assets/csv directory exists
	const csvDir = "assets/csv";
	if (!fs.existsSync(csvDir)) {
		fs.mkdirSync(csvDir, { recursive: true });
	}

	const csvFilename = `oracle-comparison-table-${poolType}.csv`;
	fs.writeFileSync(`${csvDir}/${csvFilename}`, csv);
	console.log(`Generated comparison CSV: assets/csv/${csvFilename}`);
}

function generateCombinedTable() {
	const poolTypes = ["cryptoswap", "stableswap"];
	const allPoolData = {};

	// Collect all pools and their data
	for (const poolType of poolTypes) {
		const pools = discoverPools(poolType);
		for (const pool of pools) {
			try {
				allPoolData[`${poolType}-${pool}`] = loadSummaryData(pool, poolType);
			} catch (error) {
				console.error(
					`Error loading data for ${pool} (${poolType}):`,
					error.message,
				);
			}
		}
	}

	const allPools = Object.keys(allPoolData);
	if (allPools.length === 0) {
		console.log("No pool data found, skipping combined table...");
		return;
	}

	// Define key metrics for combined table
	const baseKeyMetrics = [
		{ key: "correlation", name: "Correlation", format: "decimal" },
		{
			key: "avg_price_diff_percent",
			name: "Avg Price Diff (%)",
			format: "decimal",
		},
		{ key: "tracking_error", name: "Tracking Error", format: "decimal" },
		{
			key: "stakeDao_volatility",
			name: "StakeDAO Volatility (%)",
			format: "percentage",
		},
		{
			key: "stakeDao_higher_percent",
			name: "StakeDAO Higher (%)",
			format: "percentage",
		},
	];

	const keyMetrics = [];
	for (const metric of baseKeyMetrics) {
		for (const version of [
			{ suffix: "", label: "(v1)" },
			{ suffix: "_v2", label: "(v2)" },
		]) {
			keyMetrics.push({
				key: `${metric.key}${version.suffix}`,
				name: `${metric.name} ${version.label}`.trim(),
				format: metric.format,
			});
		}
	}

	// Generate combined markdown table
	let markdown = "# Oracle Comparison Summary - All Pools\n\n";

	// Create header row
	const headerRow = ["Metric"];
	for (const pool of allPools) {
		headerRow.push(pool);
	}
	markdown += `| ${headerRow.join(" | ")} |\n`;

	// Create separator row
	const separatorRow = ["--------"];
	for (const pool of allPools) {
		separatorRow.push("-".repeat(pool.length));
	}
	markdown += `| ${separatorRow.join(" | ")} |\n`;

	for (const metric of keyMetrics) {
		const row = [metric.name];

		for (const pool of allPools) {
			const rawValue = allPoolData[pool][metric.key];
			const numValue = parseNumber(rawValue);
			if (numValue !== null) {
				let formattedValue;

				switch (metric.format) {
					case "percentage":
						if (metric.key.includes("percent") && numValue <= 100) {
							formattedValue = `${numValue.toFixed(2)}%`;
						} else {
							formattedValue = `${(numValue * 100).toFixed(2)}%`;
						}
						break;
					case "decimal":
						formattedValue = numValue.toFixed(4);
						break;
					default:
						formattedValue = rawValue ?? "N/A";
				}
				row.push(formattedValue);
			} else {
				row.push("N/A");
			}
		}

		markdown += `| ${row.join(" | ")} |\n`;
	}

	// Save combined table
	fs.writeFileSync("assets/implementations-benchmark/comparison-table-all-pools.md", markdown);
	console.log(
		"Generated combined comparison table: assets/implementations-benchmark/comparison-table-all-pools.md",
	);
}

// Run the generator
(function main() {
	console.log("Generating comparison tables...\n");

	// Generate separate tables for each pool type
	const poolTypes = ["cryptoswap", "stableswap"];
	for (const poolType of poolTypes) {
		console.log(`\nProcessing ${poolType} pools...`);
		generateComparisonTable(poolType);
	}

	// Generate combined table
	console.log("\nGenerating combined table...");
	generateCombinedTable();

	console.log("\nAll comparison tables generated!");
})();
