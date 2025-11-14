// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {StakeDAOStableSwapOracleV2} from "src/stakedao/StakeDAOStableSwapOracleV2.sol";
import {StableSnapshot} from "test/implementations-benchmark/StableSnapshot.sol";

contract LegBenchmark_cbBTCwBTC is StableSnapshot {
    constructor() StableSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x839d6bDeDFF886404A6d7a788ef241e4e28F4802; // cbBTC/wBTC
        config.directory = "leg-sensitivity-benchmark/stableswap/cbBTCwBTC";
    }

    function _preDeploySetup() internal override {
        // No need to set any feeds for this pool as coins0 is the loan asset
        config.sdOracleConfig.loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
    }

    ///////////////////////////////////////////////////////////////

    function _deployPersistently() internal override {
        vm.startPrank(DEPLOYER);

        address oracleCoins0;
        {
            address[] memory token0ToUsdFeeds = new address[](1);
            token0ToUsdFeeds[0] = 0x2665701293fCbEB223D11A08D826563EDcCE423A; // cBTC/USD
            uint256[] memory token0ToUsdHeartbeats = new uint256[](1);
            token0ToUsdHeartbeats[0] = 1 days;

            oracleCoins0 = address(
                new StakeDAOStableSwapOracleV2(
                    config.curvePool,
                    0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, // USDC
                    0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6, // USDC/USD
                    1 days,
                    token0ToUsdFeeds,
                    token0ToUsdHeartbeats,
                    36,
                    0 // cBTC
                )
            );
        }
        vm.makePersistent(oracleCoins0);

        address oracleCoins1;
        {
            address[] memory token0ToUsdFeeds = new address[](2);
            token0ToUsdFeeds[0] = 0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23; // wBTC/BTC
            token0ToUsdFeeds[1] = 0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c; // BTC/USD
            uint256[] memory token0ToUsdHeartbeats = new uint256[](2);
            token0ToUsdHeartbeats[0] = 1 days;
            token0ToUsdHeartbeats[1] = 1 hours;

            oracleCoins1 = address(
                new StakeDAOStableSwapOracleV2(
                    config.curvePool,
                    0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, // USDC
                    0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6, // USDC/USD
                    1 days,
                    token0ToUsdFeeds,
                    token0ToUsdHeartbeats,
                    36,
                    1 // wBTC
                )
            );
        }
        vm.makePersistent(oracleCoins1);

        // Push the oracles to the config structure
        config.oracles
            .push(Oracles({addr: oracleCoins0, path: _filename("/sd-stableswap-v2-coins0"), id: OracleID.STAKEDAO_V2}));
        config.oracles
            .push(Oracles({addr: oracleCoins1, path: _filename("/sd-stableswap-v2-coins1"), id: OracleID.STAKEDAO_V2}));
    }
}
