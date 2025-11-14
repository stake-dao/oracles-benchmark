# Oracle Comparison Summary - Cryptoswap Pools

| Metric                             | GHOcbBTCETH | USDCwBTCETH | USDTwBTCETH |
| ---------------------------------- | ----------- | ----------- | ----------- |
| Total Data Points (v1)             | 362         | 364         | 363         |
| Total Data Points (v2)             | N/A         | N/A         | N/A         |
| Correlation (v1)                   | 1.0000      | 1.0000      | 1.0000      |
| Correlation (v2)                   | N/A         | N/A         | N/A         |
| Average Price Difference (%) (v1)  | 0.0000      | 0.0000      | 0.0000      |
| Average Price Difference (%) (v2)  | N/A         | N/A         | N/A         |
| Max Price Difference (%) (v1)      | 0.0000      | 0.0000      | 0.0000      |
| Max Price Difference (%) (v2)      | N/A         | N/A         | N/A         |
| Min Price Difference (%) (v1)      | 0.0000      | 0.0000      | 0.0000      |
| Min Price Difference (%) (v2)      | N/A         | N/A         | N/A         |
| Standard Deviation (Absolute) (v1) | 0.0000      | 0.0000      | 0.0000      |
| Standard Deviation (Absolute) (v2) | N/A         | N/A         | N/A         |
| Standard Deviation (%) (v1)        | 0.0000      | 0.0000      | 0.0000      |
| Standard Deviation (%) (v2)        | N/A         | N/A         | N/A         |
| Tracking Error (v1)                | 0.0000      | 0.0000      | 0.0000      |
| Tracking Error (v2)                | N/A         | N/A         | N/A         |
| StakeDAO Volatility (%) (v1)       | 182.48%     | 189.98%     | 187.77%     |
| StakeDAO Volatility (%) (v2)       | N/A         | N/A         | N/A         |
| Curve Volatility (%) (v1)          | 182.48%     | 189.98%     | 187.77%     |
| Curve Volatility (%) (v2)          | N/A         | N/A         | N/A         |
| Information Ratio (v1)             | 0.0000      | 0.0000      | 0.0000      |
| Information Ratio (v2)             | N/A         | N/A         | N/A         |
| Max Drawdown (%) (v1)              | 11.13%      | 11.34%      | 11.02%      |
| Max Drawdown (%) (v2)              | N/A         | N/A         | N/A         |
| Median Absolute Deviation (v1)     | 0.0000      | 0.0000      | 0.0000      |
| Median Absolute Deviation (v2)     | N/A         | N/A         | N/A         |
| StakeDAO Higher (%) (v1)           | 0.00%       | 0.00%       | 0.00%       |
| StakeDAO Higher (%) (v2)           | N/A         | N/A         | N/A         |
| StakeDAO Lower (%) (v1)            | 0.00%       | 0.00%       | 0.00%       |
| StakeDAO Lower (%) (v2)            | N/A         | N/A         | N/A         |
| Prices Equal (%) (v1)              | 100.00%     | 100.00%     | 100.00%     |
| Prices Equal (%) (v2)              | N/A         | N/A         | N/A         |

## Interpretation Guide

- **Correlation**: 1.0 = perfect correlation, 0.0 = no correlation
- **Price Differences**: Lower is better (closer to Curve's oracle)
- **Tracking Error**: Lower is better (more consistent with Curve)
- **Volatility**: Lower is better (more stable pricing)
- **Information Ratio**: Positive = StakeDAO outperforms, Negative = Curve outperforms
- **Relative Performance**: 50/50 split = no bias, higher % = systematic bias

- **Version Labels**: Metrics marked (v1) or (v2) correspond to the respective StakeDAO oracle generation compared against Curve

## Performance Summary

- **Best Correlation (v1)**: USDTwBTCETH (100.000%)
- **Lowest Tracking Error (v1)**: USDTwBTCETH (0.000000)
- **Most Balanced (v1)**: USDTwBTCETH (0.00% difference)
