// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {CryptoSnapshot} from "test/implementations-benchmark/CryptoSnapshot.sol";

contract Snapshot_USDCwBTCETH is CryptoSnapshot {
    constructor() CryptoSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B; // USDC/wBTC/ETH
        config.directory = "cryptoswap/USDCwBTCETH";
    }

    function _preDeploySetup() internal override {
        // coins0 is already the loan asset (USDC), so we don't have to set the pool asset feeds nor the loan asset feed
        config.sdOracleConfig.loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
    }
}
