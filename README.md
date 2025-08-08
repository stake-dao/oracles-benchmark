# Curve Oracles Benchmark

Minimalistic benchmark for Curve oracles.

## Stableswap Oracles

### cbBTC/wBTC

The data are [here](./data/stableswap/cbBTCwBTC) and the CSV files are [here](./assets/csv).

| pool      | total_data_points | avg_price_diff | avg_price_diff_percent | max_price_diff | min_price_diff | max_price_diff_percent | min_price_diff_percent | std_dev_price_diff | correlation | stakeDao_volatility | curve_volatility | tracking_error | max_drawdown | information_ratio | stakeDao_sharpe | median_absolute_deviation | stakeDao_higher_percent | stakeDao_lower_percent | stakeDao_equal_percent |
| --------- | ----------------- | -------------- | ---------------------- | -------------- | -------------- | ---------------------- | ---------------------- | ------------------ | ----------- | ------------------- | ---------------- | -------------- | ------------ | ----------------- | --------------- | ------------------------- | ----------------------- | ---------------------- | ---------------------- |
| cbBTCwBTC | 726               | 247.968370     | 0.2410                 | 2089.080291    | -238.503802    | 1.9831                 | -0.1964                | 443.194266         | 0.999117    | 1.373635            | 1.443098         | 507.847880     | 0.108068     | 0.488273          | 0.000434        | 315.253231                | 50.14                   | 49.31                  | 0.55                   |

![cbBTC/wBTC](./assets/screens/cbBTCwBTC.png)

### ETH/stETH

The data are [here](./data/stableswap/ETHstETH) and the CSV files are [here](./assets/csv).

| pool     | total_data_points | avg_price_diff | avg_price_diff_percent | max_price_diff | min_price_diff | max_price_diff_percent | min_price_diff_percent | std_dev_price_diff | correlation | stakeDao_volatility | curve_volatility | tracking_error | max_drawdown | information_ratio | stakeDao_sharpe | median_absolute_deviation | stakeDao_higher_percent | stakeDao_lower_percent | stakeDao_equal_percent |
| -------- | ----------------- | -------------- | ---------------------- | -------------- | -------------- | ---------------------- | ---------------------- | ------------------ | ----------- | ------------------- | ---------------- | -------------- | ------------ | ----------------- | --------------- | ------------------------- | ----------------------- | ---------------------- | ---------------------- |
| ETHstETH | 723               | 2.638704       | 0.0990                 | 28.903434      | -15.392911     | 0.9947                 | -0.3943                | 6.164099           | 0.999961    | 2.817048            | 2.834783         | 6.705138       | 0.236539     | 0.393535          | 0.000512        | 4.238029                  | 47.16                   | 52.84                  | 0.00                   |

![ETH/stETH](./assets/screens/ETHstETH.png)

### USDC/USDT

The data are [here](./data/stableswap/USDCUSDT) and the CSV files are [here](./assets/csv).

| pool     | total_data_points | avg_price_diff | avg_price_diff_percent | max_price_diff | min_price_diff | max_price_diff_percent | min_price_diff_percent | std_dev_price_diff | correlation | stakeDao_volatility | curve_volatility | tracking_error | max_drawdown | information_ratio | stakeDao_sharpe | median_absolute_deviation | stakeDao_higher_percent | stakeDao_lower_percent | stakeDao_equal_percent |
| -------- | ----------------- | -------------- | ---------------------- | -------------- | -------------- | ---------------------- | ---------------------- | ------------------ | ----------- | ------------------- | ---------------- | -------------- | ------------ | ----------------- | --------------- | ------------------------- | ----------------------- | ---------------------- | ---------------------- |
| USDCUSDT | 727               | 0.000001       | 0.0001                 | 0.000642       | -0.000657      | 0.0638                 | -0.0653                | 0.000081           | 0.995926    | 0.007426            | 0.007784         | 0.000081       | 0.000311     | 0.015425          | 0.000779        | 0.000023                  | 11.42                   | 11.14                  | 77.44                  |

![USDC/USDT](./assets/screens/USDCUSDT.png)
