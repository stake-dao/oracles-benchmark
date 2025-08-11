// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {StableSnapshot, IFeed} from "test/StableSnapshot.sol";
import {Math} from "openzeppelin-contracts/contracts/utils/math/Math.sol";

contract Snapshot_cbBTCwBTC is StableSnapshot {
    constructor() StableSnapshot() {
        config.network = "mainnet";
        config.curvePool = 0x839d6bDeDFF886404A6d7a788ef241e4e28F4802; // cbBTC/wBTC
        config.directory = "stableswap/cbBTCwBTC";
    }

    function _preDeploySetup() internal override {
        // Deploy the custom wBTC/USD feed
        vm.prank(DEPLOYER);
        address wbtcUsdFeed = address(
            new WBTCUSDOracle(
                0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23, // wBTC/BTC
                0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c // BTC/USD
            )
        );
        vm.makePersistent(wbtcUsdFeed);

        config.sdOracleConfig.poolAssetFeeds.push(0x2665701293fCbEB223D11A08D826563EDcCE423A); // cBTC/USD
        config.sdOracleConfig.poolAssetFeeds.push(wbtcUsdFeed); // wBTC/USD
        config.sdOracleConfig.poolAssetHeartbeats.push(1 days);
        config.sdOracleConfig.poolAssetHeartbeats.push(1 hours); // btc/usd is updated every 1 hour

        config.sdOracleConfig.loanAsset = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
        config.sdOracleConfig.loanAssetFeed = 0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6; // USDC/USD
        config.sdOracleConfig.loanAssetHeartbeat = 1 days;
    }
}

/// @notice Chainlink-compatible custom oracle that creates a price feed for wBTC/USD from wBTC/BTC and BTC/USD
contract WBTCUSDOracle is IFeed {
    IFeed public immutable WBTC_BTC_FEED;
    IFeed public immutable BTC_USD_FEED;

    constructor(address _WBTC_BTC_FEED, address _BTC_USD_FEED) {
        WBTC_BTC_FEED = IFeed(_WBTC_BTC_FEED);
        BTC_USD_FEED = IFeed(_BTC_USD_FEED);
    }

    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80) {
        // Get wBTC/BTC price (usually 1e18)
        (uint80 _roundId, int256 wbtcBtc, uint256 _startedAt, uint256 _updatedAt, uint80 _answeredInRound) =
            WBTC_BTC_FEED.latestRoundData();

        // Get BTC/USD price
        (uint80 __roundId, int256 btcUsd, uint256 __startedAt, uint256 __updatedAt, uint80 __answeredInRound) =
            BTC_USD_FEED.latestRoundData();

        // Calculate: (wBTC/BTC) × (BTC/USD) = wBTC/USD
        // Both inputs are 8 decimals, result will be 16 decimals
        // Scale down to 8 decimals: divide by 10^8
        uint256 price = Math.mulDiv(uint256(wbtcBtc), uint256(btcUsd), 10 ** 8);
        return (
            _roundId > __roundId ? _roundId : __roundId,
            int256(price),
            _startedAt > __startedAt ? _startedAt : __startedAt,
            _updatedAt > __updatedAt ? _updatedAt : __updatedAt,
            _answeredInRound > __answeredInRound ? _answeredInRound : __answeredInRound
        );
    }

    function decimals() external pure returns (uint8) {
        return 8;
    }
}
