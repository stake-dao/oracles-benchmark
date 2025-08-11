# Curve Oracles Benchmark

Minimalistic benchmark for Curve oracles.

## Stableswap Oracles

### Oracle Comparison Summary

| Metric                        | cbBTC/wBTC | ETH/stETH | USDC/USDT |
| ----------------------------- | ---------- | --------- | --------- |
| Total Data Points             | 726        | 723       | 727       |
| Correlation                   | 0.9991     | 0.9999    | 0.9959    |
| Average Price Difference (%)  | 0.2410     | 0.0990    | 0.0001    |
| Max Price Difference (%)      | 1.9831     | 0.9947    | 0.0638    |
| Min Price Difference (%)      | -0.1964    | -0.3943   | -0.0653   |
| Standard Deviation (Absolute) | 443.1943   | 6.1641    | 0.0001    |
| Standard Deviation (%)        | 0.4272     | 0.2179    | 0.0081    |
| Tracking Error                | 507.8479   | 6.7051    | 0.0001    |
| StakeDAO Volatility (%)       | 137.36%    | 281.70%   | 0.74%     |
| Curve Volatility (%)          | 144.31%    | 283.48%   | 0.78%     |
| Information Ratio             | 0.4883     | 0.3935    | 0.0154    |
| Max Drawdown (%)              | 10.81%     | 23.65%    | 0.03%     |
| Median Absolute Deviation     | 315.2532   | 4.2380    | 0.0000    |
| StakeDAO Higher (%)           | 50.14%     | 47.16%    | 11.42%    |
| StakeDAO Lower (%)            | 49.31%     | 52.84%    | 11.14%    |
| Prices Equal (%)              | 0.55%      | 0.00%     | 77.44%    |

#### Interpretation Guide

- **Correlation**: 1.0 = perfect correlation, 0.0 = no correlation
- **Price Differences**: Lower is better (closer to Curve's oracle)
- **Tracking Error**: Lower is better (more consistent with Curve)
- **Volatility**: Lower is better (more stable pricing)
- **Information Ratio**: Positive = StakeDAO outperforms, Negative = Curve outperforms
- **Relative Performance**: 50/50 split = no bias, higher % = systematic bias

#### Performance Summary

- **Best Correlation**: ETHstETH (99.996%)
- **Lowest Tracking Error**: USDCUSDT (0.000081)
- **Most Balanced**: USDCUSDT (0.28% difference)

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
| Total Data Points             | 242         | 243         | 243         |
| Correlation                   | 1.0000      | 1.0000      | 1.0000      |
| Average Price Difference (%)  | 0.0000      | 0.0000      | 0.0000      |
| Max Price Difference (%)      | 0.0000      | 0.0000      | 0.0000      |
| Min Price Difference (%)      | 0.0000      | 0.0000      | 0.0000      |
| Standard Deviation (Absolute) | 0.0000      | 0.0000      | 0.0000      |
| Standard Deviation (%)        | 0.0000      | 0.0000      | 0.0000      |
| Tracking Error                | 0.0000      | 0.0000      | 0.0000      |
| StakeDAO Volatility (%)       | 239.27%     | 235.47%     | 237.57%     |
| Curve Volatility (%)          | 239.27%     | 235.47%     | 237.57%     |
| Information Ratio             | 0.0000      | 0.0000      | 0.0000      |
| Max Drawdown (%)              | 10.36%      | 10.61%      | 10.24%      |
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
| Correlation             | 1.0000                 | 1.0000                 | 1.0000                 | 1.0000              | 0.9959              | 0.9991               |
| Avg Price Diff (%)      | 0.0000                 | 0.0000                 | 0.0000                 | 0.0990              | 0.0001              | 0.2410               |
| Tracking Error          | 0.0000                 | 0.0000                 | 0.0000                 | 6.7051              | 0.0001              | 507.8479             |
| StakeDAO Volatility (%) | 239.27%                | 235.47%                | 237.57%                | 281.70%             | 0.74%               | 137.36%              |
| StakeDAO Higher (%)     | 0.00%                  | 0.00%                  | 0.00%                  | 47.16%              | 11.42%              | 50.14%               |
