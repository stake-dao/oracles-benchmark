// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {StableSnapshot} from "test/StableSnapshot.sol";

contract Snapshot_sUSDSUSDT is StableSnapshot {
    constructor() StableSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x00836Fe54625BE242BcFA286207795405ca4fD10; // sUSD/USDT
        config.directory = "stableswap/sUSDSUSDT";
        vm.label(config.curvePool, "CurvePool");
    }

    function _preDeploySetup() internal override {
        address coins0USDSOracle = address(new sUSDSUSDSOracle());
        vm.makePersistent(coins0USDSOracle);

        config.sdOracleConfig.poolAssetFeeds.push(coins0USDSOracle); // SUSDS/USDS (6 decimals)
        config.sdOracleConfig.poolAssetHeartbeats.push(1 hours);
        config.sdOracleConfig.poolAssetFeeds.push(0xfF30586cD0F29eD462364C7e81375FC0C71219b1); // USDS/USD (8 decimals)
        config.sdOracleConfig.poolAssetHeartbeats.push(23 hours);

        config.sdOracleConfig.loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
        config.sdOracleConfig.loanAssetFeed = 0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6; // USDC/USD
        config.sdOracleConfig.loanAssetHeartbeat = 1 days;

        vm.label(coins0USDSOracle, "sUSDS/USDS Oracle");
        vm.label(0xfF30586cD0F29eD462364C7e81375FC0C71219b1, "USDS/USD Oracle");
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

    // Aggregate the different source of prices into one for the Curve Oracle
    function _deployCurveOracle() internal override returns (address coin0Oracle, address curveOracle) {
        coin0Oracle = address(
            new AggregateOracleForCurveOracle(
                config.sdOracleConfig.poolAssetFeeds[0], config.sdOracleConfig.poolAssetFeeds[1]
            )
        ); // SUSDS/USD (18 decimals)

        curveOracle = address(
            deployCode("out/CurveLPOracleStable.vy/CurveLPOracleStable.json", abi.encode(config.curvePool, coin0Oracle))
        );
    }
}

interface IERC4626 {
    function convertToAssets(uint256 shares) external view returns (uint256);
}

interface IERC20Metadata {
    function decimals() external view returns (uint8);
}

interface ChainlinkOracle {
    function latestRoundData() external view returns (uint256, int256 answer, uint256, uint256 updatedAt, uint80);
    function decimals() external view returns (uint8);
}

contract sUSDSUSDSOracle is ChainlinkOracle {
    IERC4626 private constant SUSDS = IERC4626(0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD);
    IERC20Metadata private constant SUSD = IERC20Metadata(0xdAC17F958D2ee523a2206206994597C13D831ec7);
    uint256 private immutable SUSD_DECIMALS; // 6

    constructor() {
        SUSD_DECIMALS = SUSD.decimals();
    }

    function latestRoundData() public view returns (uint256, int256 answer, uint256, uint256 updatedAt, uint80) {
        answer = int256(SUSDS.convertToAssets(10 ** SUSD_DECIMALS));
        updatedAt = block.timestamp;
    }

    function decimals() public view returns (uint8) {
        return uint8(SUSD_DECIMALS);
    }
}

contract AggregateOracleForCurveOracle {
    ChainlinkOracle private immutable SUSDSUSDSORACLE;
    ChainlinkOracle private immutable USDSUSDORACLE;
    uint256 private immutable SCALING_FACTOR; // to always return 18 decimals

    constructor(address susdsusdsOracle, address USDSUSDOracle) {
        SUSDSUSDSORACLE = ChainlinkOracle(susdsusdsOracle);
        USDSUSDORACLE = ChainlinkOracle(USDSUSDOracle);

        SCALING_FACTOR = 10 ** (decimals() - SUSDSUSDSORACLE.decimals() - USDSUSDORACLE.decimals());
    }

    function price() public view returns (uint256) {
        (, int256 susdsUsdsPrice,,,) = SUSDSUSDSORACLE.latestRoundData();
        (, int256 usdsUsdPrice,,,) = USDSUSDORACLE.latestRoundData();

        return uint256(susdsUsdsPrice * usdsUsdPrice) * SCALING_FACTOR;
    }

    function price_w() public view returns (uint256) {
        return price();
    }

    function decimals() public view returns (uint8) {
        return 18;
    }
}
