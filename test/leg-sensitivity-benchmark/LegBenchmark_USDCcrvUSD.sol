// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {StakeDAOStableSwapOracleV2} from "src/stakedao/StakeDAOStableSwapOracleV2.sol";
import {StableSnapshot} from "test/implementations-benchmark/StableSnapshot.sol";

contract LegBenchmark_USDCcrvUSD is StableSnapshot {
    constructor() StableSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x4DEcE678ceceb27446b35C672dC7d61F30bAD69E; // USDC/crvUSD
        config.directory = "leg-sensitivity-benchmark/stableswap/USDCcrvUSD";
    }

    function _preDeploySetup() internal override {
        // No need to set any feeds for this pool as coins0 is the loan asset
        config.sdOracleConfig.loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
    }

    ///////////////////////////////////////////////////////////////

    function _deployPersistently() internal override {
        vm.startPrank(DEPLOYER);

        // Deploy Stake DAO Oracle implementation #1
        address oracleCoins0 = address(
            new StakeDAOStableSwapOracleV2(
                config.curvePool,
                config.sdOracleConfig.loanAsset,
                address(0),
                0,
                new address[](0),
                new uint256[](0),
                36,
                0 // USDC
            )
        );
        vm.makePersistent(oracleCoins0);

        // Deploy Stake DAO Oracle implementation #2
        address[] memory token0ToUsdFeeds = new address[](1);
        token0ToUsdFeeds[0] = 0xEEf0C605546958c1f899b6fB336C20671f9cD49F; // crvUSD/USD
        uint256[] memory token0ToUsdHeartbeats = new uint256[](1);
        token0ToUsdHeartbeats[0] = 1 days;

        address oracleCoins1 = address(
            new StakeDAOStableSwapOracleV2(
                config.curvePool,
                config.sdOracleConfig.loanAsset,
                0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6, // USDC/USD
                23 hours, // USDC/USD heartbeat
                token0ToUsdFeeds,
                token0ToUsdHeartbeats,
                36,
                1 // crvUSD
            )
        );
        vm.makePersistent(oracleCoins1);

        // Push the oracles to the config structure
        config.oracles
            .push(Oracles({addr: oracleCoins0, path: _filename("/sd-stableswap-v2-coins0"), id: OracleID.STAKEDAO_V2}));
        config.oracles
            .push(Oracles({addr: oracleCoins1, path: _filename("/sd-stableswap-v2-coins1"), id: OracleID.STAKEDAO_V2}));
    }
}
