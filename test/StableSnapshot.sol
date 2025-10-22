// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import "test/BaseSnapshot.sol";
import {StakeDAOStableSwapOracle} from "src/stakedao/StakeDAOStableSwapOracle.sol";

abstract contract StableSnapshot is BaseSnapshot {
    function _deployPersistently() internal override {
        vm.startPrank(DEPLOYER);

        // Deploy Stake DAO Oracle implementation #1
        address stakeDAOOracle = address(
            new StakeDAOStableSwapOracle(
                config.curvePool,
                config.sdOracleConfig.loanAsset,
                config.sdOracleConfig.loanAssetFeed,
                config.sdOracleConfig.loanAssetHeartbeat,
                config.sdOracleConfig.poolAssetFeeds,
                config.sdOracleConfig.poolAssetHeartbeats
            )
        );
        vm.makePersistent(stakeDAOOracle);

        // Deploy the coin0 Oracle implementation for the Curve Oracle
        (address coin0Oracle, address curveOracle) = _deployCurveOracle();
        vm.makePersistent(coin0Oracle);
        vm.makePersistent(curveOracle);
        vm.stopPrank();

        // Push the oracles to the config structure
        config.oracles.push(Oracles({addr: stakeDAOOracle, path: _filename("/sd-stableswap"), id: OracleID.STAKEDAO}));
        config.oracles.push(Oracles({addr: curveOracle, path: _filename("/curve-stableswap"), id: OracleID.CURVE}));
    }

    function _deployCurveOracle() internal virtual returns (address coin0Oracle, address curveOracle) {
        // If needed, deploy the coin0 Oracle implementation for the Curve Oracle
        coin0Oracle = config.sdOracleConfig.poolAssetFeeds.length > 0
            ? address(new MockCurvePriceFeed(config.sdOracleConfig.poolAssetFeeds[0]))
            : config.sdOracleConfig.loanAssetFeed != address(0)
                ? address(new MockCurvePriceFeed(config.sdOracleConfig.loanAssetFeed))
                : address(0);

        // Deploy the Curve Oracle implementation
        curveOracle = address(
            deployCode("out/CurveLPOracleStable.vy/CurveLPOracleStable.json", abi.encode(config.curvePool, coin0Oracle))
        );
    }
}
