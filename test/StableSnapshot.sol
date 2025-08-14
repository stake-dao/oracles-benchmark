// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import "test/BaseSnapshot.sol";
import {StakeDAOStableSwapOracle} from "src/stakedao/StakeDAOStableSwapOracle.sol";

abstract contract StableSnapshot is BaseSnapshot {
    function _deployPersistently() internal override {
        vm.startPrank(DEPLOYER);

        // Deploy the collateral token. Some pools handle the LP token as well. Some use a separate token.
        // `curvePoolToken` is optional but must be set for pools that use a separate token.
        address collateral = address(
            new MockCollateralToken(config.curvePoolToken != address(0) ? config.curvePoolToken : config.curvePool)
        );
        vm.makePersistent(collateral);

        // Deploy Stake DAO Oracle implementation #1
        address stakeDAOOracle = address(
            new StakeDAOStableSwapOracle(
                config.curvePool,
                collateral,
                config.sdOracleConfig.loanAsset,
                config.sdOracleConfig.loanAssetFeed,
                config.sdOracleConfig.loanAssetHeartbeat,
                config.sdOracleConfig.poolAssetFeeds,
                config.sdOracleConfig.poolAssetHeartbeats
            )
        );
        vm.makePersistent(stakeDAOOracle);

        // Deploy the coin0 Oracle implementation for the Curve Oracle
        address coin0Oracle = config.sdOracleConfig.poolAssetFeeds.length > 0
            ? address(new MockCurveOracle(config.sdOracleConfig.poolAssetFeeds[0]))
            : config.sdOracleConfig.loanAssetFeed != address(0)
                ? address(new MockCurveOracle(config.sdOracleConfig.loanAssetFeed))
                : address(0);
        vm.makePersistent(coin0Oracle);

        // Deploy the Curve Oracle implementation
        address curveOracle = address(
            deployCode("out/CurveLPOracleStable.vy/CurveLPOracleStable.json", abi.encode(config.curvePool, coin0Oracle))
        );
        vm.makePersistent(curveOracle);
        vm.stopPrank();

        // Push the oracles to the config structure
        config.oracles.push(Oracles({addr: stakeDAOOracle, path: _filename("/sd-stableswap"), id: OracleID.STAKEDAO}));
        config.oracles.push(Oracles({addr: curveOracle, path: _filename("/curve-stableswap"), id: OracleID.CURVE}));
    }
}
