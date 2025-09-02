// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {StableSnapshot} from "test/StableSnapshot.sol";

contract Snapshot_ETHstETH is StableSnapshot {
    constructor() StableSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x21E27a5E5513D6e65C4f830167390997aA84843a; // ETH/stETH
        config.directory = "stableswap/ETHstETH";
    }

    function _preDeploySetup() internal override {
        config.sdOracleConfig.poolAssetFeeds.push(
            0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
        ); // ETH/USD
        config.sdOracleConfig.poolAssetHeartbeats.push(1 hours);

        config
            .sdOracleConfig
            .loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
        config
            .sdOracleConfig
            .loanAssetFeed = 0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6; // USDC/USD
        config.sdOracleConfig.loanAssetHeartbeat = 1 days;
    }
}
