// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {
    CurveCryptoswapOracle
} from "contracts-monorepo/packages/strategies/src/integrations/curve/oracles/CurveCryptoswapOracle.sol";

contract StakeDAOCryptoOracle is CurveCryptoswapOracle {
    constructor(
        address _curvePool,
        address _loanAsset,
        address _loanAssetFeed,
        uint256 _loanAssetHeartbeat,
        address[] memory _token0ToUsdFeeds,
        uint256[] memory _token0ToUsdHeartbeats
    )
        CurveCryptoswapOracle(
            _curvePool, _loanAsset, _loanAssetFeed, _loanAssetHeartbeat, _token0ToUsdFeeds, _token0ToUsdHeartbeats, 36
        )
    {}
}
