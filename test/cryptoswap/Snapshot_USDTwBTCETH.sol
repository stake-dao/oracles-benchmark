// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {CryptoSnapshot} from "test/CryptoSnapshot.sol";

contract Snapshot_USDTwBTCETH is CryptoSnapshot {
    constructor() CryptoSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0xf5f5B97624542D72A9E06f04804Bf81baA15e2B4; // USDT/wBTC/ETH
        config.directory = "cryptoswap/USDTwBTCETH";
    }

    function _preDeploySetup() internal override {
        // USDT is coins0
        config.sdOracleConfig.poolAssetFeeds.push(0x3E7d1eAB13ad0104d2750B8863b489D65364e32D); // USDT/USD
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
        blocksPerInterval *= 3;

        return (startBlock, endBlock, blocksPerInterval);
    }
}
