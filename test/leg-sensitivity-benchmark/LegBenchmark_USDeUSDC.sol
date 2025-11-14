// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {StakeDAOStableSwapOracleV2} from "src/stakedao/StakeDAOStableSwapOracleV2.sol";
import {StableSnapshot} from "test/implementations-benchmark/StableSnapshot.sol";

contract LegBenchmark_USDeUSDC is StableSnapshot {
    constructor() StableSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72; // USDe/USDC
        config.directory = "leg-sensitivity-benchmark/stableswap/USDeUSDC";
    }

    function _preDeploySetup() internal override {
        config.sdOracleConfig.loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
    }

    ///////////////////////////////////////////////////////////////

    function _deployPersistently() internal override {
        vm.startPrank(DEPLOYER);

        address oracleCoins0;
        {
            address[] memory token0ToUsdFeeds = new address[](1);
            token0ToUsdFeeds[0] = 0xa569d910839Ae8865Da8F8e70FfFb0cBA869F961; // USDe/USDC
            uint256[] memory token0ToUsdHeartbeats = new uint256[](1);
            token0ToUsdHeartbeats[0] = 23 hours;

            oracleCoins0 = address(
                new StakeDAOStableSwapOracleV2(
                    config.curvePool,
                    0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, // USDC
                    0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6, // USDC/USD
                    1 days,
                    token0ToUsdFeeds,
                    token0ToUsdHeartbeats,
                    36,
                    0 // USDe
                )
            );
        }
        vm.makePersistent(oracleCoins0);

        address oracleCoins1;
        {
            oracleCoins1 = address(
                new StakeDAOStableSwapOracleV2(
                    config.curvePool,
                    config.sdOracleConfig.loanAsset,
                    address(0),
                    0,
                    new address[](0),
                    new uint256[](0),
                    36,
                    1 // USDC
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
