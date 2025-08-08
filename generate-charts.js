const fs = require("node:fs");

function loadOracleData(filePath) {
	const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return data
		.filter((entry) => entry.price > 0)
		.map((entry) => ({
			x: new Date(entry.timestamp * 1000), // Convert to Date
			y: Number.parseFloat(entry.price) / 1e18, // Convert to readable price
		}));
}

function generateChartHTML(stakeDaoData, curveData, poolName) {
	const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Oracle Comparison - ${poolName}</title>
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
                datasets: [{
                    label: 'Curve Oracle',
                    data: ${JSON.stringify(curveData)},
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.1
                },{
                    label: 'StakeDAO Oracle',
                    data: ${JSON.stringify(stakeDaoData)},
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.1
                }]
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
                        text: 'Oracle Price Comparison - ${poolName}'
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

	fs.writeFileSync(
		`assets/charts/oracle-comparison-${poolName.replace("/", "")}.html`,
		html,
	);
}

(function main() {
	const pools = ["cbBTCwBTC", "ETHstETH", "USDCUSDT"];

	for (const pool of pools) {
		const stakeDaoData = loadOracleData(
			`data/stableswap/${pool}/sd-stable.json`,
		);
		const curveData = loadOracleData(
			`data/stableswap/${pool}/curve-stable.json`,
		);
		generateChartHTML(stakeDaoData, curveData, pool);
	}
})();
