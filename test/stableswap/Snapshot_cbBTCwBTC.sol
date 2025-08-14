// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {StableSnapshot} from "test/StableSnapshot.sol";

contract Snapshot_cbBTCwBTC is StableSnapshot {
    constructor() StableSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x839d6bDeDFF886404A6d7a788ef241e4e28F4802; // cbBTC/wBTC
        config.directory = "stableswap/cbBTCwBTC";
    }

    function _preDeploySetup() internal override {
        config.sdOracleConfig.poolAssetFeeds.push(0x2665701293fCbEB223D11A08D826563EDcCE423A); // cBTC/USD
        config.sdOracleConfig.poolAssetHeartbeats.push(1 days);

        config.sdOracleConfig.loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
        config.sdOracleConfig.loanAssetFeed = 0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6; // USDC/USD
        config.sdOracleConfig.loanAssetHeartbeat = 1 days;
    }
}
