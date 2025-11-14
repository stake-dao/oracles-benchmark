// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {StableSnapshot} from "test/implementations-benchmark/StableSnapshot.sol";

contract Snapshot_frxUSDcrvUSD is StableSnapshot {
    constructor() StableSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x13e12BB0E6A2f1A3d6901a59a9d585e89A6243e1; // frxUSD/crvUSD
        config.directory = "implementations-benchmark/stableswap/frxUSDcrvUSD";

        vm.label(config.curvePool, "CurvePool");
    }

    function _preDeploySetup() internal override {
        config.sdOracleConfig.poolAssetFeeds.push(0x9B4a96210bc8D9D55b1908B465D8B0de68B7fF83); // frxUSD/USD
        config.sdOracleConfig.poolAssetHeartbeats.push(1 days);

        config.sdOracleConfig.loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
        config.sdOracleConfig.loanAssetFeed = 0x3E7d1eAB13ad0104d2750B8863b489D65364e32D; // USDC/USD
        config.sdOracleConfig.loanAssetHeartbeat = 1 days;
    }

    /// @notice Get the environment config
    function _getEnvironmentConfig()
        internal
        override
        returns (uint256 startBlock, uint256 endBlock, uint256 blocksPerInterval)
    {
        (startBlock, endBlock, blocksPerInterval) = super._getEnvironmentConfig();
        startBlock = 22876984; // Tue, 8 Jul 2025 20:53:47 +0000
        endBlock = 23717710; // Mon, 3 Nov 2025 08:49:35 +0000
    }
}
