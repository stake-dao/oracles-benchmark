// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {BaseSnapshot} from "test/BaseSnapshot.sol";

contract Snapshot_USDCUSDT is BaseSnapshot {
    constructor() BaseSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x4f493B7dE8aAC7d55F71853688b1F7C8F0243C85; // USDC/USDT
        config.directory = "stableswap/USDCUSDT";
    }

    function _preDeploySetup() internal override {
        config.sdOracleConfig.poolAssetFeeds.push(0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6); // USDC/USD
        config.sdOracleConfig.poolAssetFeeds.push(0x3E7d1eAB13ad0104d2750B8863b489D65364e32D); // USDT/USD
        config.sdOracleConfig.poolAssetHeartbeats.push(1 days);
        config.sdOracleConfig.poolAssetHeartbeats.push(1 days);

        config.sdOracleConfig.loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
        config.sdOracleConfig.loanAssetFeed = 0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6; // USDC/USD
        config.sdOracleConfig.loanAssetHeartbeat = 1 days;
    }

    function _getEnvironmentConfig()
        internal
        override
        returns (uint256 startBlock, uint256 endBlock, uint256 blocksPerInterval)
    {
        (startBlock, endBlock, blocksPerInterval) = super._getEnvironmentConfig();
        startBlock = 23_026_942 + blocksPerInterval;

        return (startBlock, endBlock, blocksPerInterval);
    }
}
