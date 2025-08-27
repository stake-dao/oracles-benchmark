// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import "test/BaseSnapshot.sol";
import {StakeDAOCryptoOracle} from "src/stakedao/StakeDAOCryptoOracle.sol";

abstract contract CryptoSnapshot is BaseSnapshot {
    function _deployPersistently() internal override {
        vm.startPrank(DEPLOYER);

        // Deploy Stake DAO Oracle implementation #1
        address stakeDAOOracle = address(
            new StakeDAOCryptoOracle(
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
        address coin0Oracle = config.sdOracleConfig.poolAssetFeeds.length > 0
            ? address(new MockCurveOracle(config.sdOracleConfig.poolAssetFeeds[0]))
            : config.sdOracleConfig.loanAssetFeed != address(0)
                ? address(new MockCurveOracle(config.sdOracleConfig.loanAssetFeed))
                : address(0);
        vm.makePersistent(coin0Oracle);

        // Deploy the Curve Oracle implementation
        address curveOracle = address(
            deployCode("out/CurveLPOracleCrypto.vy/CurveLPOracleCrypto.json", abi.encode(config.curvePool, coin0Oracle))
        );
        vm.makePersistent(curveOracle);
        vm.stopPrank();

        // Push the oracles to the config structure
        config.oracles.push(Oracles({addr: stakeDAOOracle, path: _filename("/sd-cryptoswap"), id: OracleID.STAKEDAO}));
        config.oracles.push(Oracles({addr: curveOracle, path: _filename("/curve-cryptoswap"), id: OracleID.CURVE}));
    }
}
