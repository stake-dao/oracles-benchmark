# Oracle Comparison Summary - Stableswap Pools

| Metric                        | CRVsdCRV | ETHstETH | USDCUSDT | USDCUSDU | USDCUSDf | USDCcrvUSD | USDTcrvUSD | cbBTCwBTC | frxUSDcrvUSD | pyUSDcrvUSD | sUSDSUSDT | wETHfrxETH | yCRVCRV |
| ----------------------------- | -------- | -------- | -------- | -------- | -------- | ---------- | ---------- | --------- | ------------ | ----------- | --------- | ---------- | ------- |
| Total Data Points             | 363      | 363      | 364      | N/A      | 364      | 364        | 364        | 363       | 351          | 364         | 175       | 363        | 257     |
| Correlation                   | 1.0000   | 1.0000   | 1.0000   | N/A      | 1.0000   | 1.0000     | 1.0000     | 1.0000    | 1.0000       | 1.0000      | 1.0000    | 1.0000     | 1.0000  |
| Average Price Difference (%)  | 0.0000   | 0.0000   | 0.0000   | N/A      | 0.0000   | 0.0000     | 0.0000     | 0.0000    | 0.0000       | 0.0000      | 0.0000    | 0.0000     | 0.0000  |
| Max Price Difference (%)      | 0.0000   | 0.0000   | 0.0000   | N/A      | 0.0000   | 0.0000     | 0.0000     | 0.0000    | 0.0000       | 0.0000      | 0.0000    | 0.0000     | 0.0000  |
| Min Price Difference (%)      | 0.0000   | 0.0000   | 0.0000   | N/A      | 0.0000   | 0.0000     | 0.0000     | 0.0000    | 0.0000       | 0.0000      | 0.0000    | 0.0000     | 0.0000  |
| Standard Deviation (Absolute) | 0.0000   | 0.0000   | 0.0000   | N/A      | 0.0000   | 0.0000     | 0.0000     | 0.0000    | 0.0000       | 0.0000      | 0.0000    | 0.0000     | 0.0000  |
| Standard Deviation (%)        | 0.0000   | 0.0000   | 0.0000   | N/A      | 0.0000   | 0.0000     | 0.0000     | 0.0000    | 0.0000       | 0.0000      | 0.0000    | 0.0000     | 0.0000  |
| Tracking Error                | 0.0000   | 0.0000   | 0.0000   | N/A      | 0.0000   | 0.0000     | 0.0000     | 0.0000    | 0.0000       | 0.0000      | 0.0000    | 0.0000     | 0.0000  |
| StakeDAO Volatility (%)       | 666.66%  | 413.31%  | 1.02%    | N/A      | 10.40%   | 0.75%      | 1.94%      | 209.56%   | 5.59%        | 4.41%       | 1.55%     | 413.60%    | 93.69%  |
| Curve Volatility (%)          | 666.66%  | 413.31%  | 1.02%    | N/A      | 10.40%   | 0.75%      | 1.94%      | 209.56%   | 5.59%        | 4.41%       | 1.55%     | 413.60%    | 93.69%  |
| Information Ratio             | 0.0000   | 0.0000   | 0.0000   | N/A      | 0.0000   | 0.0000     | 0.0000     | 0.0000    | 0.0000       | 0.0000      | 0.0000    | 0.0000     | 0.0000  |
| Max Drawdown (%)              | 44.17%   | 23.47%   | 0.06%    | N/A      | 0.66%    | 0.03%      | 0.06%      | 11.06%    | 0.27%        | 0.27%       | 0.04%     | 23.52%     | 31.97%  |
| Median Absolute Deviation     | 0.0000   | 0.0000   | 0.0000   | N/A      | 0.0000   | 0.0000     | 0.0000     | 0.0000    | 0.0000       | 0.0000      | 0.0000    | 0.0000     | 0.0000  |
| StakeDAO Higher (%)           | 0.00%    | 0.00%    | 0.00%    | N/A      | 0.00%    | 0.00%      | 0.00%      | 0.00%     | 0.00%        | 0.00%       | 0.00%     | 0.00%      | 0.00%   |
| StakeDAO Lower (%)            | 0.00%    | 0.00%    | 0.00%    | N/A      | 0.00%    | 0.00%      | 0.00%      | 0.00%     | 0.00%        | 0.00%       | 0.00%     | 0.00%      | 0.00%   |
| Prices Equal (%)              | 100.00%  | 100.00%  | 100.00%  | N/A      | 100.00%  | 100.00%    | 100.00%    | 100.00%   | 100.00%      | 100.00%     | 100.00%   | 100.00%    | 100.00% |

## Interpretation Guide

- **Correlation**: 1.0 = perfect correlation, 0.0 = no correlation
- **Price Differences**: Lower is better (closer to Curve's oracle)
- **Tracking Error**: Lower is better (more consistent with Curve)
- **Volatility**: Lower is better (more stable pricing)
- **Information Ratio**: Positive = StakeDAO outperforms, Negative = Curve outperforms
- **Relative Performance**: 50/50 split = no bias, higher % = systematic bias

## Performance Summary

- **Best Correlation**: yCRVCRV (100.000%)
- **Lowest Tracking Error**: yCRVCRV (0.000000)
- **Most Balanced**: yCRVCRV (0.00% difference)
