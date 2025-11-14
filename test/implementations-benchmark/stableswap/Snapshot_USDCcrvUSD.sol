// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {StableSnapshot} from "test/implementations-benchmark/StableSnapshot.sol";

contract Snapshot_USDCcrvUSD is StableSnapshot {
    constructor() StableSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x4DEcE678ceceb27446b35C672dC7d61F30bAD69E; // USDC/crvUSD
        config.directory = "implementations-benchmark/stableswap/USDCcrvUSD";
    }

    function _preDeploySetup() internal override {
        // No need to set any feeds for this pool as coins0 is the loan asset
        config.sdOracleConfig.loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
    }
}
