# Curve Oracles Benchmark

Minimalistic benchmark for Curve oracles.

The data is located [here](./data) while the generated assets are located [here](./assets). The asset directory contains interactive charts and CSV files.

## Oracle Comparison Summary - All Pools

| Metric                  | cryptoswap-GHOcbBTCETH | cryptoswap-USDCwBTCETH | cryptoswap-USDTwBTCETH | stableswap-CRVsdCRV | stableswap-ETHstETH | stableswap-USDCUSDT | stableswap-USDCUSDf | stableswap-USDCcrvUSD | stableswap-USDTcrvUSD | stableswap-cbBTCwBTC | stableswap-sUSDSUSDT | stableswap-wETHfrxETH | stableswap-yCRVCRV |
| ----------------------- | ---------------------- | ---------------------- | ---------------------- | ------------------- | ------------------- | ------------------- | ------------------- | --------------------- | --------------------- | -------------------- | -------------------- | --------------------- | ------------------ |
| Correlation             | 1.0000                 | 1.0000                 | 1.0000                 | 1.0000              | 1.0000              | 1.0000              | 1.0000              | 1.0000                | 1.0000                | 1.0000               | 0.9986               | 1.0000                | 1.0000             |
| Avg Price Diff (%)      | 0.0000                 | 0.0000                 | 0.0000                 | 0.0000              | 0.0000              | 0.0000              | 0.0000              | 0.0000                | 0.0000                | 0.0000               | 6.0596               | 0.0000                | 0.0000             |
| Tracking Error          | 0.0000                 | 0.0000                 | 0.0000                 | 0.0000              | 0.0000              | 0.0000              | 0.0000              | 0.0000                | 0.0000                | 0.0000               | 0.0613               | 0.0000                | 0.0000             |
| StakeDAO Volatility (%) | 182.48%                | 189.98%                | 187.77%                | 666.66%             | 413.31%             | 1.02%               | 10.40%              | 0.75%                 | 1.94%                 | 209.56%              | 1.55%                | 413.60%               | 93.69%             |
| StakeDAO Higher (%)     | 0.00%                  | 0.00%                  | 0.00%                  | 0.00%               | 0.00%               | 0.00%               | 0.00%               | 0.00%                 | 0.00%                 | 0.00%                | 0.00%                | 0.00%                 | 0.00%              |

## Stableswap Oracles

| Metric                        | CRVsdCRV | ETHstETH | USDCUSDT | USDCUSDf | USDCcrvUSD | USDTcrvUSD | cbBTCwBTC | sUSDSUSDT | wETHfrxETH | yCRVCRV |
| ----------------------------- | -------- | -------- | -------- | -------- | ---------- | ---------- | --------- | --------- | ---------- | ------- |
| Total Data Points             | 363      | 363      | 364      | 364      | 364        | 364        | 363       | 175       | 363        | 257     |
| Correlation                   | 1.0000   | 1.0000   | 1.0000   | 1.0000   | 1.0000     | 1.0000     | 1.0000    | 0.9986    | 1.0000     | 1.0000  |
| Average Price Difference (%)  | 0.0000   | 0.0000   | 0.0000   | 0.0000   | 0.0000     | 0.0000     | 0.0000    | 6.0596    | 0.0000     | 0.0000  |
| Max Price Difference (%)      | 0.0000   | 0.0000   | 0.0000   | 0.0000   | 0.0000     | 0.0000     | 0.0000    | 6.4584    | 0.0000     | 0.0000  |
| Min Price Difference (%)      | 0.0000   | 0.0000   | 0.0000   | 0.0000   | 0.0000     | 0.0000     | 0.0000    | 5.6679    | 0.0000     | 0.0000  |
| Standard Deviation (Absolute) | 0.0000   | 0.0000   | 0.0000   | 0.0000   | 0.0000     | 0.0000     | 0.0000    | 0.0025    | 0.0000     | 0.0000  |
| Standard Deviation (%)        | 0.0000   | 0.0000   | 0.0000   | 0.0000   | 0.0000     | 0.0000     | 0.0000    | 0.2329    | 0.0000     | 0.0000  |
| Tracking Error                | 0.0000   | 0.0000   | 0.0000   | 0.0000   | 0.0000     | 0.0000     | 0.0000    | 0.0613    | 0.0000     | 0.0000  |
| StakeDAO Volatility (%)       | 666.66%  | 413.31%  | 1.02%    | 10.40%   | 0.75%      | 1.94%      | 209.56%   | 1.55%     | 413.60%    | 93.69%  |
| Curve Volatility (%)          | 666.66%  | 413.31%  | 1.02%    | 10.40%   | 0.75%      | 1.94%      | 209.56%   | 2.02%     | 413.60%    | 93.69%  |
| Information Ratio             | 0.0000   | 0.0000   | 0.0000   | 0.0000   | 0.0000     | 0.0000     | 0.0000    | 0.9992    | 0.0000     | 0.0000  |
| Max Drawdown (%)              | 44.17%   | 23.47%   | 0.06%    | 0.66%    | 0.03%      | 0.06%      | 11.06%    | 0.04%     | 23.52%     | 31.97%  |
| Median Absolute Deviation     | 0.0000   | 0.0000   | 0.0000   | 0.0000   | 0.0000     | 0.0000     | 0.0000    | 0.0022    | 0.0000     | 0.0000  |
| StakeDAO Higher (%)           | 0.00%    | 0.00%    | 0.00%    | 0.00%    | 0.00%      | 0.00%      | 0.00%     | 0.00%     | 0.00%      | 0.00%   |
| StakeDAO Lower (%)            | 0.00%    | 0.00%    | 0.00%    | 0.00%    | 0.00%      | 0.00%      | 0.00%     | 100.00%   | 0.00%      | 0.00%   |
| Prices Equal (%)              | 100.00%  | 100.00%  | 100.00%  | 100.00%  | 100.00%    | 100.00%    | 100.00%   | 0.00%     | 100.00%    | 100.00% |

### Interpretation Guide

- **Correlation**: 1.0 = perfect correlation, 0.0 = no correlation
- **Price Differences**: Lower is better (closer to Curve's oracle)
- **Tracking Error**: Lower is better (more consistent with Curve)
- **Volatility**: Lower is better (more stable pricing)
- **Information Ratio**: Positive = StakeDAO outperforms, Negative = Curve outperforms
- **Relative Performance**: 50/50 split = no bias, higher % = systematic bias

### Performance Summary

- **Best Correlation**: yCRVCRV (100.000%)
- **Lowest Tracking Error**: yCRVCRV (0.000000)
- **Most Balanced**: yCRVCRV (0.00% difference)

### Notes

> [!WARNING]
> Regarding the sUSDS/USDT pool.
> The price difference between both oracles is explained by the fact that Curve's oracle is pricing the underlying token instead of the appreciating token while pricing coins0.
> This results in a higher price for the LP token. This is a known issue that is covered by our implementation.

## Cryptoswap Oracles

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

### Interpretation Guide

- **Correlation**: 1.0 = perfect correlation, 0.0 = no correlation
- **Price Differences**: Lower is better (closer to Curve's oracle)
- **Tracking Error**: Lower is better (more consistent with Curve)
- **Volatility**: Lower is better (more stable pricing)
- **Information Ratio**: Positive = StakeDAO outperforms, Negative = Curve outperforms
- **Relative Performance**: 50/50 split = no bias, higher % = systematic bias

### Performance Summary

- **Best Correlation**: USDTwBTCETH (100.000%)
- **Lowest Tracking Error**: USDTwBTCETH (0.000000)
- **Most Balanced**: USDTwBTCETH (0.00% difference)
