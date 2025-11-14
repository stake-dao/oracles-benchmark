// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {StakeDAOStableSwapOracleV2} from "src/stakedao/StakeDAOStableSwapOracleV2.sol";
import {StableSnapshot} from "test/implementations-benchmark/StableSnapshot.sol";

contract LegBenchmark_sUSDSUSDT is StableSnapshot {
    constructor() StableSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x00836Fe54625BE242BcFA286207795405ca4fD10; // sUSD/USDT
        config.directory = "leg-sensitivity-benchmark/stableswap/sUSDSUSDT";
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
            token0ToUsdFeeds[0] = 0xfF30586cD0F29eD462364C7e81375FC0C71219b1; // USDS/USD
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
                    0 // USDS
                )
            );
        }
        vm.makePersistent(oracleCoins0);

        address oracleCoins1;
        {
            address[] memory token0ToUsdFeeds = new address[](1);
            token0ToUsdFeeds[0] = 0x3E7d1eAB13ad0104d2750B8863b489D65364e32D; // USDT/USD
            uint256[] memory token0ToUsdHeartbeats = new uint256[](1);
            token0ToUsdHeartbeats[0] = 24 hours;

            oracleCoins1 = address(
                new StakeDAOStableSwapOracleV2(
                    config.curvePool,
                    0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, // USDC
                    0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6, // USDC/USD
                    1 days,
                    token0ToUsdFeeds,
                    token0ToUsdHeartbeats,
                    36,
                    1 // USDT
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

    /// @notice Get the environment config
    function _getEnvironmentConfig()
        internal
        override
        returns (uint256 startBlock, uint256 endBlock, uint256 blocksPerInterval)
    {
        (startBlock, endBlock, blocksPerInterval) = super._getEnvironmentConfig();
        startBlock = 22781035; // Wed Jun 25 11:03:59 2025 UTC
        endBlock = 23217703; // Mon Aug 25 11:03:59 2025 UTC
    }
}
