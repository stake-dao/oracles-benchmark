// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {StableSnapshot} from "test/implementations-benchmark/StableSnapshot.sol";

contract Snapshot_sUSDSUSDT is StableSnapshot {
    constructor() StableSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x00836Fe54625BE242BcFA286207795405ca4fD10; // sUSD/USDT
        config.directory = "implementations-benchmark/stableswap/sUSDSUSDT";
        vm.label(config.curvePool, "CurvePool");
    }

    function _preDeploySetup() internal override {
        config.sdOracleConfig.poolAssetFeeds.push(0xfF30586cD0F29eD462364C7e81375FC0C71219b1); // USDS/USD (8 decimals)
        config.sdOracleConfig.poolAssetHeartbeats.push(23 hours);

        config.sdOracleConfig.loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
        config.sdOracleConfig.loanAssetFeed = 0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6; // USDC/USD
        config.sdOracleConfig.loanAssetHeartbeat = 1 days;

        vm.label(0xfF30586cD0F29eD462364C7e81375FC0C71219b1, "USDS/USD Oracle");
    }

    /// @notice Get the environment config
    function _getEnvironmentConfig()
        internal
        override
        returns (uint256 startBlock, uint256 endBlock, uint256 blocksPerInterval)
    {
        (startBlock, endBlock, blocksPerInterval) = super._getEnvironmentConfig();
        startBlock = 22781035; // Wed Jun 25 11:03:59 2025 UTC
        endBlock = 23217703; // Mon Aug 25 11:03:59 2025 UTC
    }
}
