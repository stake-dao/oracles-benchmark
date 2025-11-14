// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {StableSnapshot} from "test/implementations-benchmark/StableSnapshot.sol";

contract Snapshot_USDCUSDT is StableSnapshot {
    constructor() StableSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x4f493B7dE8aAC7d55F71853688b1F7C8F0243C85; // USDC/USDT
        config.directory = "implementations-benchmark/stableswap/USDCUSDT";
    }

    function _preDeploySetup() internal override {
        // No need to set any feeds for this pool as coins0 is the loan asset
        config.sdOracleConfig.loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
    }
}
