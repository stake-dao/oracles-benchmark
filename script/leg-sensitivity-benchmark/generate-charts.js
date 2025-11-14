const fs = require("node:fs");
const path = require("node:path");

const DATA_ROOT = path.join("data", "leg-sensitivity-benchmark");
const OUTPUT_DIR = path.join(
	"assets",
	"leg-sensitivity-benchmark",
	"charts",
);

function loadOracleData(filePath) {
	const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return raw
		.filter((entry) => entry.price > 0)
		.map((entry) => ({
			x: new Date(entry.timestamp * 1000),
			y: Number.parseFloat(entry.price) / 1e18,
		}));
}

function buildDatasets(files) {
	const colors = [
		"rgb(54, 162, 235)",
		"rgb(255, 99, 132)",
		"rgb(75, 192, 192)",
		"rgb(255, 205, 86)",
		"rgb(153, 102, 255)",
		"rgb(255, 159, 64)",
		"rgb(201, 203, 207)",
	];

	return files.map((file, index) => {
		const color = colors[index % colors.length];
		return {
			label: file.label,
			data: file.data,
			borderColor: color,
			backgroundColor: color.replace("rgb", "rgba").replace(")", ", 0.1)"),
			tension: 0.1,
		};
	});
}

function generateChartHTML(datasets, poolName, poolType) {
	const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Leg Sensitivity - ${poolName} (${poolType})</title>
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
                            text: 'LP Price'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'StakeDAO StableSwap v2 Leg Sensitivity - ${poolName} (${poolType})'
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

	const filename = `leg-sensitivity-${poolType}-${poolName.replace(/[\\/\\\\]/g, "")}.html`;
	fs.writeFileSync(path.join(OUTPUT_DIR, filename), html);
}

function discoverPoolTypes() {
	if (!fs.existsSync(DATA_ROOT)) {
		console.error(`Data root ${DATA_ROOT} not found`);
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
		.map((dirent) => dirent.name)
		.filter((name) => name.includes("coins"))
		.map((name) => ({
			path: path.join(poolPath, name),
			label: name.replace(".json", "").split("coins").pop(),
		}))
		.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
}

function processPool(poolType, poolName) {
	const legFiles = discoverLegFiles(poolType, poolName);

	if (legFiles.length === 0) {
		console.log(
			`No leg configuration data found for ${poolName} (${poolType}), skipping...`,
		);
		return;
	}

	try {
		const datasets = buildDatasets(
			legFiles.map((file) => ({
				label: `coins${file.label}`,
				data: loadOracleData(file.path),
			})),
		);

		generateChartHTML(datasets, poolName, poolType);
		console.log(
			`Generated leg sensitivity chart for ${poolName} (${poolType}) with ${datasets.length} legs`,
		);
	} catch (error) {
		console.error(
			`Error processing ${poolName} (${poolType}): ${error.message}`,
		);
	}
}

(function main() {
	if (!fs.existsSync(OUTPUT_DIR)) {
		fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	const poolTypes = discoverPoolTypes();
	for (const poolType of poolTypes) {
		console.log(`\nProcessing ${poolType} pools...`);
		const pools = discoverPools(poolType);
		for (const pool of pools) {
			processPool(poolType, pool);
		}
	}

	console.log("\nLeg sensitivity charts generated!");
})();
