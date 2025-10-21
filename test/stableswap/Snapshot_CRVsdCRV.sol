// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {StableSnapshot} from "test/StableSnapshot.sol";

contract Snapshot_CRVsdCRV is StableSnapshot {
    constructor() StableSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0xCA0253A98D16e9C1e3614caFDA19318EE69772D0; // CRV/sdCRV
        config.directory = "stableswap/CRVsdCRV";
    }

    function _preDeploySetup() internal override {
        config.sdOracleConfig.poolAssetFeeds.push(0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f); // CRV/USD
        config.sdOracleConfig.poolAssetHeartbeats.push(1 days);

        config.sdOracleConfig.loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
        config.sdOracleConfig.loanAssetFeed = 0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6; // USDC/USD
        config.sdOracleConfig.loanAssetHeartbeat = 1 days;
    }
}
