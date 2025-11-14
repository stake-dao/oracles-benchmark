// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {CurveStableswapOracleV2} from "@periphery/src/lending/oracles/v2/CurveStableswapOracleV2.sol";

contract StakeDAOStableSwapOracleV2 is CurveStableswapOracleV2 {
    constructor(
        address _curvePool,
        address _quoteAsset,
        address _quoteAssetFeed,
        uint256 _quoteAssetFeedHeartbeat,
        address[] memory _denomToUsdFeeds,
        uint256[] memory _denomToUsdHeartbeats,
        uint256 _scalingExponent,
        uint256 _denomIndex
    )
        CurveStableswapOracleV2(
            _curvePool,
            _quoteAsset,
            _quoteAssetFeed,
            _quoteAssetFeedHeartbeat,
            _denomToUsdFeeds,
            _denomToUsdHeartbeats,
            _scalingExponent,
            _denomIndex
        )
    {}
}
