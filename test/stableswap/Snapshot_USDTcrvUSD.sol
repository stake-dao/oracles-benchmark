// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {StableSnapshot} from "test/StableSnapshot.sol";

contract Snapshot_USDTcrvUSD is StableSnapshot {
    constructor() StableSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x390f3595bCa2Df7d23783dFd126427CCeb997BF4; // USDT/crvUSD
        config.directory = "stableswap/USDTcrvUSD";
    }

    function _preDeploySetup() internal override {
        config.sdOracleConfig.poolAssetFeeds.push(0x3E7d1eAB13ad0104d2750B8863b489D65364e32D); // USDT/USD
        config.sdOracleConfig.poolAssetHeartbeats.push(1 days);

        config.sdOracleConfig.loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
        config.sdOracleConfig.loanAssetFeed = 0x3E7d1eAB13ad0104d2750B8863b489D65364e32D; // USDC/USD
        config.sdOracleConfig.loanAssetHeartbeat = 1 days;
    }
}
