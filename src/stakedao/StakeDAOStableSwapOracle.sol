// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {CurveStableswapOracle} from
    "contracts-monorepo/packages/strategies/src/integrations/curve/oracles/CurveStableswapOracle.sol";

contract StakeDAOStableSwapOracle is CurveStableswapOracle {
    constructor(
        address _curvePool,
        address _loanAsset,
        address _loanAssetFeed,
        uint256 _loanAssetFeedHeartbeat,
        address[] memory _poolAssetFeeds,
        uint256[] memory _poolAssetHeartbeats
    )
        CurveStableswapOracle(
            _curvePool,
            _loanAsset,
            _loanAssetFeed,
            _loanAssetFeedHeartbeat,
            _poolAssetFeeds,
            _poolAssetHeartbeats,
            36
        )
    {}
}
