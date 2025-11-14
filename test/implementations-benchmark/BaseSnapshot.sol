// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {Math} from "openzeppelin-contracts/contracts/utils/math/Math.sol";

abstract contract BaseSnapshot is Test {
    uint256 private immutable BLOCKS_PER_INTERVAL;
    uint256 private immutable START_BLOCK;
    uint256 private immutable END_BLOCK;
    address internal immutable DEPLOYER;

    enum OracleID {
        NONE,
        CURVE,
        STAKEDAO,
        STAKEDAO_V2
    }

    struct Oracles {
        address addr;
        string path;
        OracleID id;
    }

    struct SDOracleConfig {
        address loanAsset;
        address loanAssetFeed;
        uint256 loanAssetHeartbeat;
        address[] poolAssetFeeds;
        uint256[] poolAssetHeartbeats;
    }

    struct Config {
        Oracles[] oracles;
        SDOracleConfig sdOracleConfig;
        string network;
        address curvePool;
        address curvePoolToken; // optional, if the pool token is not the same as the pool itself
        string directory;
    }

    Config internal config;

    constructor() {
        (START_BLOCK, END_BLOCK, BLOCKS_PER_INTERVAL) = _getEnvironmentConfig();
        DEPLOYER = makeAddr("deployer");
    }

    ///////////////////////////////////////////////////////////////
    // --- SETUP
    ///////////////////////////////////////////////////////////////
    function setUp() public virtual {
        // Fork the network
        vm.createSelectFork(config.network, START_BLOCK - 1);

        // Run pre-deploy setup
        // @dev The config structure must be populated before deploying except the `oracles` array
        _preDeploySetup();

        // Deploy the oracles and store them in the config structure
        _deployPersistently();

        // Clean the output file before starting
        for (uint256 i; i < config.oracles.length; i++) {
            if (vm.exists(config.oracles[i].path)) vm.removeFile(config.oracles[i].path);
        }
    }

    /// @notice Get the environment config
    function _getEnvironmentConfig()
        internal
        virtual
        returns (uint256 startBlock, uint256 endBlock, uint256 blocksPerInterval)
    {
        startBlock = 22_216_942; //Sat, Mon April 7, 12:12:11, 2025 UTC
        endBlock = 23_090_359; // Thu, 7 Aug 2025 16:25:11 +0000
        blocksPerInterval = 2400; // ~8 hours

        return (startBlock, endBlock, blocksPerInterval);
    }

    ///////////////////////////////////////////////////////////////
    // --- TEST
    ///////////////////////////////////////////////////////////////

    function test_fork_benchmarkOracle() external {
        for (uint256 i; i < config.oracles.length; i++) {
            vm.writeLine(config.oracles[i].path, "[");
        }

        for (uint256 currentBlock = START_BLOCK; currentBlock <= END_BLOCK; currentBlock += BLOCKS_PER_INTERVAL) {
            // fast forward to the expected block
            vm.createSelectFork(config.network, currentBlock);

            // Snapshot the prices returned by each oracle
            bool isLastSnapshot = currentBlock + BLOCKS_PER_INTERVAL > END_BLOCK;
            for (uint256 j; j < config.oracles.length; j++) {
                (uint256 rawPrice, uint256 price) = _fetchPrice(config.oracles[j]);
                vm.writeLine(config.oracles[j].path, _formatJSONData(rawPrice, price, currentBlock, isLastSnapshot));
            }
        }

        for (uint256 i; i < config.oracles.length; i++) {
            vm.writeLine(config.oracles[i].path, "]");
            emit log_named_string("Oracle comparison completed. Results saved to", config.oracles[i].path);
        }
    }

    ///////////////////////////////////////////////////////////////
    // --- TO OVERRIDE
    ///////////////////////////////////////////////////////////////

    /// @notice Set the config object except the `oracles` array
    function _preDeploySetup() internal virtual {}

    /// @notice Deploy the oracle implementations persistently
    function _deployPersistently() internal virtual {}

    ///////////////////////////////////////////////////////////////
    // --- UTILS
    ///////////////////////////////////////////////////////////////

    /// @notice Fetch the price of the oracle, upscale/downscale it to 1e18 if needed and return it in loan asset unit
    function _fetchPrice(Oracles memory oracle) internal view returns (uint256, uint256) {
        if (oracle.id == OracleID.STAKEDAO || oracle.id == OracleID.STAKEDAO_V2) {
            try IOracle(oracle.addr).price() returns (uint256 price) {
                uint256 decimals = IOracle(oracle.addr).decimals();

                if (decimals < 18) return (price, price * 10 ** (18 - decimals));
                else if (decimals > 18) return (price, price / 10 ** (decimals - 18));
                else return (price, price);
            } catch {
                return (0, 0); // failure -- Incorrect price returned for this block
            }
        } else if (oracle.id == OracleID.CURVE) {
            uint256 priceUsd1e18 = IOracle(oracle.addr).price(); // LP in USD, 1e18
            if (config.sdOracleConfig.loanAssetFeed == address(0)) return (priceUsd1e18, priceUsd1e18);

            (, int256 answer,,,) = IFeed(config.sdOracleConfig.loanAssetFeed).latestRoundData();
            uint256 loanUsd = uint256(answer);
            require(loanUsd > 0, "loan feed zero");

            uint256 loanFeedDec = IFeed(config.sdOracleConfig.loanAssetFeed).decimals();
            // LP/Loan scaled to 1e18: floor(priceUsd1e18 * 10^loanFeedDec / loanUsd)
            uint256 price = Math.mulDiv(priceUsd1e18, 10 ** loanFeedDec, loanUsd);
            return (price, price);
        } else {
            revert("Invalid oracle ID");
        }
    }

    function _filename(string memory key) internal view returns (string memory) {
        return string.concat("data/", config.directory, "/", key, ".json");
    }

    function _formatJSONData(uint256 rawPrice, uint256 price, uint256 currentBlock, bool isLastSnapshot)
        internal
        view
        returns (string memory data)
    {
        string memory rawPriceStr;
        if (rawPrice != price) rawPriceStr = string.concat(",", '"raw_price":', vm.toString(rawPrice));

        data = string.concat(
            "{",
            '"block_number":',
            vm.toString(currentBlock),
            ",",
            '"timestamp":',
            vm.toString(block.timestamp),
            ",",
            '"price":',
            vm.toString(price),
            rawPriceStr,
            "}",
            isLastSnapshot ? "" : ","
        );
    }
}

// Always return 18 decimals the price to the Curve Oracle
contract MockCurvePriceFeed {
    address private immutable WRAPPED_ORACLE;

    constructor(address wrappedOracle) {
        WRAPPED_ORACLE = wrappedOracle;
    }

    function _fetch() internal view returns (uint256) {
        (, int256 answer,,,) = IFeed(WRAPPED_ORACLE).latestRoundData();
        require(answer > 0, "Invalid price");

        uint8 decimals = IFeed(WRAPPED_ORACLE).decimals();
        uint256 _price = uint256(answer);

        if (decimals < 18) return _price * 10 ** (18 - decimals);
        if (decimals > 18) return _price / 10 ** (decimals - 18);
        return _price;
    }

    function price() external view returns (uint256) {
        return _fetch();
    }

    function price_w() external view returns (uint256) {
        return _fetch();
    }
}

interface IERC20Metadata {
    function decimals() external view returns (uint8);
}

interface IOracle {
    function price() external view returns (uint256);
    function decimals() external view returns (uint8);
}

interface IFeed {
    function decimals() external view returns (uint8);
    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

interface ICurvePool {
    function lp_token() external view returns (address);
}
