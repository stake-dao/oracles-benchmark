const fs = require("node:fs");
const path = require("node:path");

function loadOracleData(filePath) {
	const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return data
		.filter((entry) => entry.price > 0)
		.map((entry) => ({
			x: new Date(entry.timestamp * 1000), // Convert to Date
			y: Number.parseFloat(entry.price) / 1e18, // Convert to readable price
		}));
}

function generateChartHTML(stakeDaoData, curveData, stakeDaoV2Data, poolName, poolType) {
	const datasets = [
		{
			label: "Curve Oracle",
			data: curveData,
			borderColor: "rgb(54, 162, 235)",
			backgroundColor: "rgba(54, 162, 235, 0.1)",
			tension: 0.1,
		},
		{
			label: "StakeDAO Oracle v1",
			data: stakeDaoData,
			borderColor: "rgb(255, 99, 132)",
			backgroundColor: "rgba(255, 99, 132, 0.1)",
			tension: 0.1,
		},
		{
			label: "StakeDAO Oracle v2",
			data: stakeDaoV2Data,
			borderColor: "rgb(75, 192, 192)",
			backgroundColor: "rgba(75, 192, 192, 0.1)",
			tension: 0.1,
		}
	];

	const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Oracle Comparison - ${poolName} (${poolType})</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.min.js"></script>
</head>
<body>
    <canvas id="oracleChart" width="1200" height="600"></canvas>
    <script>
        const ctx = document.getElementById('oracleChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                datasets: ${JSON.stringify(datasets)}
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        },
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Price (LP/Loan)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Oracle Price Comparison - ${poolName} (${poolType})'
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x',
                            modifierKey: 'shift'
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'x',
                            drag: {
                                enabled: true,
                                backgroundColor: 'rgba(225,225,225,0.3)',
                                borderColor: 'rgba(225,225,225)',
                                borderWidth: 1
                            }
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>`;

	// Create filename with pool type prefix to avoid conflicts
	const filename = `oracle-comparison-${poolType}-${poolName.replace(/[\/\\]/g, "")}.html`;
	fs.writeFileSync(`assets/charts/${filename}`, html);
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
		const stakeDaoV2Data = loadOracleData(sdV2File)

		generateChartHTML(
			stakeDaoData,
			curveData,
			stakeDaoV2Data,
			poolName,
			poolType,
		);
		console.log(`Generated chart for ${poolName} (${poolType})`);
	} catch (error) {
		console.error(
			`Error processing pool ${poolName} (${poolType}):`,
			error.message,
		);
	}
}

(function main() {
	const poolTypes = ["cryptoswap", "stableswap"];

	// Ensure assets/charts directory exists
	const chartsDir = "assets/charts";
	if (!fs.existsSync(chartsDir)) {
		fs.mkdirSync(chartsDir, { recursive: true });
	}

	for (const poolType of poolTypes) {
		console.log(`\nProcessing ${poolType} pools...`);
		const pools = discoverPools(poolType);

		for (const pool of pools) {
			processPool(pool, poolType);
		}
	}

	console.log("\nChart generation completed!");
})();
