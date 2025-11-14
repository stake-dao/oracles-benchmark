# StakeDAO Curve Oracle Benchmarks

This repository hosts reproducible benchmarks for the on-chain oracle implementations that live in the [StakeDAO contracts-monorepo](https://github.com/stake-dao/contracts-monorepo/tree/main/packages/periphery). It focuses on the Curve lending oracles (`CurveStableswapOracleV2`, `CurveCryptoswapOracle`, etc.) and answers two questions:

1. **How do StakeDAO oracles compare to Curve’s official oracle (and to previous StakeDAO versions) over historical data?**
2. **Given a StableSwap v2 oracle that can “leg” the formula on any pool coin, which coin choice is the most robust?**

The repository provides raw snapshots, CSV summaries, Markdown reports, and interactive charts so teams can audit behaviour or integrate the metrics elsewhere.

## Repository layout

```
.
├── data/
│   ├── implementations-benchmark/   # JSON snapshots used to compare oracle implementations
│   └── leg-sensitivity-benchmark/   # JSON snapshots sweeping StableSwap v2 leg configurations
├── script/
│   ├── implementations-benchmark/   # NodeJS utilities that transform the data/implementations set
│   └── leg-sensitivity-benchmark/   # NodeJS utilities that analyse leg sensitivity data
└── assets/
    ├── implementations-benchmark/   # Generated charts and comparison tables for implementation tests
    └── leg-sensitivity-benchmark/   # Charts/CSV/Markdown for the leg sweep results
```

All generated material (CSV, Markdown, HTML charts) lives under `assets/…`. The raw data the scripts consume lives under `data/…`.

## Benchmarks

### 1. Implementation benchmark

- **Goal:** compare the price output of Curve’s canonical oracle with StakeDAO StableSwap/CryptoSwap oracles (v1 vs v2) on the same block-by-block dataset.
- **Data:** `data/implementations-benchmark/<poolType>/<poolName>/curve-*.json`, `sd-*.json`, `sd-*-v2.json`.
- **Outputs:** `assets/implementations-benchmark/charts/*.html`, CSVs under `assets/csv/`, and Markdown summaries under `assets/comparison-table-*.md`.
- **Scripts:** run `node script/implementations-benchmark/generate-csv.js`, `generate-comparison-table.js`, `generate-charts.js`.
- **Usage:** validates that oracle code changes (e.g., `CurveStableswapOracleV2` in the periphery package) do not introduce regressions versus Curve’s reference pricing.

### 2. Leg-sensitivity benchmark

- **Goal:** for `CurveStableswapOracleV2`, evaluate every possible “leg” (coin index) the formula can use to estimate LP value, so we can recommend the safest coin for collateralised lending.
- **Data:** `data/leg-sensitivity-benchmark/<poolType>/<poolName>/sd-stableswap-v2-coinsX.json`.
- **Outputs:** CSVs in `assets/leg-sensitivity-benchmark/csv/` plus per-pool Markdown reports in `assets/leg-sensitivity-benchmark/leg-comparison-<poolType>.md` and charts under `assets/leg-sensitivity-benchmark/charts/`.
- **Scripts:** run `node script/leg-sensitivity-benchmark/generate-csv.js`, `generate-comparison-table.js`, `generate-charts.js`.
- **Usage:** highlights volatility, drawdown, and recommendation metrics (e.g., “leg on USDC rather than crvUSD”) for each pool.

## Getting started

1. Install dependencies once: `pnpm install` (or `npm install`) at the repo root. The scripts only rely on Node.js standard libraries.
2. Fetch or refresh raw data (JSON) via your existing snapshot jobs.
3. Generate artefacts:

   ```bash
   cd script/implementations-benchmark
   node generate-csv.js
   node generate-comparison-table.js
   node generate-charts.js

   cd ../leg-sensitivity-benchmark
   node generate-csv.js
   node generate-comparison-table.js
   node generate-charts.js
   ```

4. Open the HTML files in `assets/**/charts/` for interactive curves, or inspect the CSV/Markdown outputs directly.

## Consuming the data

- **Assets directory:** contains everything needed for dashboards or reports (CSV summaries, Markdown tables, charts). Shareable artefacts live under `assets/implementations-benchmark` and `assets/leg-sensitivity-benchmark`.
- **Raw snapshots:** the source JSON files remain under `data/**`. They capture per-block price samples so you can rerun new analyses without re-snapshotting.
- **Contracts context:** whenever you update the oracle contracts in [`packages/periphery`](https://github.com/stake-dao/contracts-monorepo/tree/main/packages/periphery), re-run the benchmarks to confirm behaviour in both dimensions (implementation parity + leg choice).

## Why this matters

- **Regression safety:** ensures StakeDAO oracle upgrades remain aligned with Curve’s official oracle before being promoted to production lending markets.
- **Configuration guidance:** leg-sensitivity results quantify which collateral leg keeps LP valuations most conservative under stress, a key requirement for risk teams.
- **Auditability:** every metric is reproducible from on-chain snapshots; the repo acts as living documentation for oracle assumptions.

## Questions & contributions

If you need additional pools, metrics, or integrations, open an issue/PR here or in the [periphery repo](https://github.com/stake-dao/contracts-monorepo/tree/main/packages/periphery). The scripts are intentionally small (plain Node.js) so that adding new analyses is straightforward.
