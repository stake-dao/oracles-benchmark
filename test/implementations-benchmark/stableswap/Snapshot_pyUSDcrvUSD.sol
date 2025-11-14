// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {StableSnapshot} from "test/implementations-benchmark/StableSnapshot.sol";

contract Snapshot_pyUSDcrvUSD is StableSnapshot {
    constructor() StableSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x625E92624Bc2D88619ACCc1788365A69767f6200; // pyUSD/crvUSD
        config.directory = "implementations-benchmark/stableswap/pyUSDcrvUSD";
    }

    function _preDeploySetup() internal override {
        config.sdOracleConfig.poolAssetFeeds.push(0x8f1dF6D7F2db73eECE86a18b4381F4707b918FB1); // pyUSD/USD
        config.sdOracleConfig.poolAssetHeartbeats.push(1 days);

        config.sdOracleConfig.loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
        config.sdOracleConfig.loanAssetFeed = 0x3E7d1eAB13ad0104d2750B8863b489D65364e32D; // USDC/USD
        config.sdOracleConfig.loanAssetHeartbeat = 1 days;
    }
}
