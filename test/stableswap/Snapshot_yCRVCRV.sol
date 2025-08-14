// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {StableSnapshot} from "test/StableSnapshot.sol";

contract Snapshot_yCRVCRV is StableSnapshot {
    constructor() StableSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x99f5aCc8EC2Da2BC0771c32814EFF52b712de1E5; // yCRV/CRV
        config.directory = "stableswap/yCRVCRV";
    }

    function _preDeploySetup() internal override {
        config.sdOracleConfig.poolAssetFeeds.push(0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f); // CRV/USD
        config.sdOracleConfig.poolAssetHeartbeats.push(1 days);

        config.sdOracleConfig.loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
        config.sdOracleConfig.loanAssetFeed = 0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6; // USDC/USD
        config.sdOracleConfig.loanAssetHeartbeat = 1 days;
    }

    /// @notice Get the environment config
    function _getEnvironmentConfig()
        internal
        pure
        override
        returns (uint256 startBlock, uint256 endBlock, uint256 blocksPerInterval)
    {
        startBlock = 18765743; // timestamp: 1702331339 (Dec 11, 2023, 09:48:59 PM UTC)
        endBlock = 18766768; // timestamp: 1702343771 (Dec 12, 2023, 01:16:11 AM UTC)
        blocksPerInterval = 4; // ~48 seconds
    }
}
