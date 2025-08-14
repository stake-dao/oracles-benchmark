# Curve Oracles Benchmark

Minimalistic benchmark for Curve oracles.

## Stableswap Oracles

### Oracle Comparison Summary

| Metric                        | ETHstETH | USDCUSDT | cbBTCwBTC |
| ----------------------------- | -------- | -------- | --------- |
| Total Data Points             | 362      | 364      | 363       |
| Correlation                   | 1.0000   | 1.0000   | 1.0000    |
| Average Price Difference (%)  | 0.0000   | 0.0000   | 0.0000    |
| Max Price Difference (%)      | 0.0000   | 0.0000   | 0.0000    |
| Min Price Difference (%)      | 0.0000   | 0.0000   | 0.0000    |
| Standard Deviation (Absolute) | 0.0000   | 0.0000   | 0.0000    |
| Standard Deviation (%)        | 0.0000   | 0.0000   | 0.0000    |
| Tracking Error                | 0.0000   | 0.0000   | 0.0000    |
| StakeDAO Volatility (%)       | 418.01%  | 1.02%    | 209.56%   |
| Curve Volatility (%)          | 418.01%  | 1.02%    | 209.56%   |
| Information Ratio             | 0.0000   | 0.0000   | 0.0000    |
| Max Drawdown (%)              | 23.79%   | 0.06%    | 11.06%    |
| Median Absolute Deviation     | 0.0000   | 0.0000   | 0.0000    |
| StakeDAO Higher (%)           | 0.00%    | 0.00%    | 0.00%     |
| StakeDAO Lower (%)            | 0.00%    | 0.00%    | 0.00%     |
| Prices Equal (%)              | 100.00%  | 100.00%  | 100.00%   |

#### Interpretation Guide

- **Correlation**: 1.0 = perfect correlation, 0.0 = no correlation
- **Price Differences**: Lower is better (closer to Curve's oracle)
- **Tracking Error**: Lower is better (more consistent with Curve)
- **Volatility**: Lower is better (more stable pricing)
- **Information Ratio**: Positive = StakeDAO outperforms, Negative = Curve outperforms
- **Relative Performance**: 50/50 split = no bias, higher % = systematic bias

#### Performance Summary

- **Best Correlation**: cbBTCwBTC (100.000%)
- **Lowest Tracking Error**: cbBTCwBTC (0.000000)
- **Most Balanced**: cbBTCwBTC (0.00% difference)

### Data

#### cbBTC/wBTC

The data are [here](./data/stableswap/cbBTCwBTC) and the CSV files are [here](./assets/csv).

![cbBTC/wBTC](./assets/screens/cbBTCwBTC.png)

#### ETH/stETH

The data are [here](./data/stableswap/ETHstETH) and the CSV files are [here](./assets/csv).

![ETH/stETH](./assets/screens/ETHstETH.png)

#### USDC/USDT

The data are [here](./data/stableswap/USDCUSDT) and the CSV files are [here](./assets/csv).

![USDC/USDT](./assets/screens/USDCUSDT.png)

## Cryptoswap Oracles

### Oracle Comparison Summary

| Metric                        | GHOcbBTCETH | USDCwBTCETH | USDTwBTCETH |
| ----------------------------- | ----------- | ----------- | ----------- |
| Total Data Points             | 362         | 364         | 363         |
| Correlation                   | 1.0000      | 1.0000      | 1.0000      |
| Average Price Difference (%)  | 0.0000      | 0.0000      | 0.0000      |
| Max Price Difference (%)      | 0.0000      | 0.0000      | 0.0000      |
| Min Price Difference (%)      | 0.0000      | 0.0000      | 0.0000      |
| Standard Deviation (Absolute) | 0.0000      | 0.0000      | 0.0000      |
| Standard Deviation (%)        | 0.0000      | 0.0000      | 0.0000      |
| Tracking Error                | 0.0000      | 0.0000      | 0.0000      |
| StakeDAO Volatility (%)       | 182.48%     | 189.98%     | 187.77%     |
| Curve Volatility (%)          | 182.48%     | 189.98%     | 187.77%     |
| Information Ratio             | 0.0000      | 0.0000      | 0.0000      |
| Max Drawdown (%)              | 11.13%      | 11.34%      | 11.02%      |
| Median Absolute Deviation     | 0.0000      | 0.0000      | 0.0000      |
| StakeDAO Higher (%)           | 0.00%       | 0.00%       | 0.00%       |
| StakeDAO Lower (%)            | 0.00%       | 0.00%       | 0.00%       |
| Prices Equal (%)              | 100.00%     | 100.00%     | 100.00%     |

#### Interpretation Guide

- **Correlation**: 1.0 = perfect correlation, 0.0 = no correlation
- **Price Differences**: Lower is better (closer to Curve's oracle)
- **Tracking Error**: Lower is better (more consistent with Curve)
- **Volatility**: Lower is better (more stable pricing)
- **Information Ratio**: Positive = StakeDAO outperforms, Negative = Curve outperforms
- **Relative Performance**: 50/50 split = no bias, higher % = systematic bias

#### Performance Summary

- **Best Correlation**: USDTwBTCETH (100.000%)
- **Lowest Tracking Error**: USDTwBTCETH (0.000000)
- **Most Balanced**: USDTwBTCETH (0.00% difference)

### Data

#### GHO/cbBTC/ETH

The data are [here](./data/cryptoswap/GHOcbBTCETH) and the CSV files are [here](./assets/csv).

![GHO/cbBTC/ETH](./assets/screens/GHOcbBTCETH.png)

#### USDC/wBTC/ETH

The data are [here](./data/cryptoswap/USDCwBTCETH) and the CSV files are [here](./assets/csv).

![USDC/wBTC/ETH](./assets/screens/USDCwBTCETH.png)

#### USDT/wBTC/ETH

The data are [here](./data/cryptoswap/USDTwBTCETH) and the CSV files are [here](./assets/csv).

![USDT/wBTC/ETH](./assets/screens/USDTwBTCETH.png)

## Oracle Comparison Summary - All Pools

| Metric                  | cryptoswap-GHOcbBTCETH | cryptoswap-USDCwBTCETH | cryptoswap-USDTwBTCETH | stableswap-ETHstETH | stableswap-USDCUSDT | stableswap-cbBTCwBTC |
| ----------------------- | ---------------------- | ---------------------- | ---------------------- | ------------------- | ------------------- | -------------------- |
| Correlation             | 1.0000                 | 1.0000                 | 1.0000                 | 1.0000              | 1.0000              | 1.0000               |
| Avg Price Diff (%)      | 0.0000                 | 0.0000                 | 0.0000                 | 0.0000              | 0.0000              | 0.0000               |
| Tracking Error          | 0.0000                 | 0.0000                 | 0.0000                 | 0.0000              | 0.0000              | 0.0000               |
| StakeDAO Volatility (%) | 182.48%                | 189.98%                | 187.77%                | 418.01%             | 1.02%               | 209.56%              |
| StakeDAO Higher (%)     | 0.00%                  | 0.00%                  | 0.00%                  | 0.00%               | 0.00%               | 0.00%                |
