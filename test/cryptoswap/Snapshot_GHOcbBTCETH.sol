// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {CryptoSnapshot} from "test/CryptoSnapshot.sol";

contract Snapshot_GHOcbBTCETH is CryptoSnapshot {
    constructor() CryptoSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x8a4f252812dFF2A8636E4F7EB249d8FC2E3bd77f; // GHO/cbBTC/ETH
        config.directory = "cryptoswap/GHOcbBTCETH";
    }

    function _preDeploySetup() internal override {
        // GHO is coins0
        config.sdOracleConfig.poolAssetFeeds.push(0x3f12643D3f6f874d39C2a4c9f2Cd6f2DbAC877FC); // GHO/USD
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
