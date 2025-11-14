// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {CurveCryptoswapOracle} from "@periphery/src/lending/oracles/CurveCryptoswapOracle.sol";

contract StakeDAOCryptoOracle is CurveCryptoswapOracle {
    constructor(
        address _curvePool,
        address _loanAsset,
        address _loanAssetFeed,
        uint256 _loanAssetHeartbeat,
        address[] memory _token0ToUsdFeeds,
        uint256[] memory _token0ToUsdHeartbeats,
        uint256 _scalingExponent
    )
        CurveCryptoswapOracle(
            _curvePool,
            _loanAsset,
            _loanAssetFeed,
            _loanAssetHeartbeat,
            _token0ToUsdFeeds,
            _token0ToUsdHeartbeats,
            _scalingExponent
        )
    {}
}
