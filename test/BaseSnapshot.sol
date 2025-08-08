// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {Math} from "openzeppelin-contracts/contracts/utils/math/Math.sol";
import {StakeDAOStableSwapOracle} from "src/stakedao/StakeDAOStableSwapOracle.sol";

abstract contract BaseSnapshot is Test {
    uint256 private immutable BLOCKS_PER_INTERVAL;
    uint256 private immutable START_BLOCK;
    uint256 private immutable END_BLOCK;
    address internal immutable DEPLOYER;

    enum OracleID {
        NONE,
        CURVE,
        STAKEDAO
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
        blocksPerInterval = 1200; // ~4 hours

        return (startBlock, endBlock, blocksPerInterval);
    }

    ///////////////////////////////////////////////////////////////
    // --- TEST
    ///////////////////////////////////////////////////////////////

    function test_oracle() external {
        for (uint256 i; i < config.oracles.length; i++) {
            vm.writeLine(config.oracles[i].path, "[");
        }

        for (uint256 currentBlock = START_BLOCK; currentBlock <= END_BLOCK; currentBlock += BLOCKS_PER_INTERVAL) {
            // fast forward to the expected block
            vm.createSelectFork(config.network, currentBlock);

            // Snapshot the prices returned by each oracle
            bool isLastSnapshot = currentBlock + BLOCKS_PER_INTERVAL > END_BLOCK;
            for (uint256 j; j < config.oracles.length; j++) {
                uint256 price = _fetchPrice(config.oracles[j]);
                vm.writeLine(config.oracles[j].path, _formatJSONData(price, currentBlock, isLastSnapshot));
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

    ///////////////////////////////////////////////////////////////
    // --- UTILS
    ///////////////////////////////////////////////////////////////

    /// @notice Fetch the price of the oracle, upscale/downscale it to 1e18 if needed and return it in loan asset unit
    function _fetchPrice(Oracles memory oracle) internal view returns (uint256) {
        if (oracle.id == OracleID.STAKEDAO) {
            try IOracle(oracle.addr).price() returns (uint256 price) {
                // Downscale from 10^(36 + loanDec - collDec) to 1e18
                uint256 loanDec = IERC20Metadata(config.sdOracleConfig.loanAsset).decimals(); // 6 for USDC
                uint256 collDec = IERC20Metadata(config.curvePool).decimals(); // Get actual LP decimals
                uint256 downscaleExp = 18 + loanDec - collDec;
                return downscaleExp == 0 ? price : price / (10 ** downscaleExp);
            } catch {
                return 0; // failure -- Incorrect price returned for this block
            }
        } else if (oracle.id == OracleID.CURVE) {
            uint256 _price = IOracle(oracle.addr).price();

            // Fetch the price of the loan asset in USD
            (, int256 answer,,,) = IFeed(config.sdOracleConfig.loanAssetFeed).latestRoundData();
            uint256 _answer = uint256(answer);
            require(_answer > 0, "loan feed zero");

            // Upscale/downscale the price of the loan asset to 1e18
            uint256 loanAssetDecimals = IFeed(config.sdOracleConfig.loanAssetFeed).decimals();
            if (loanAssetDecimals < 18) _answer = _answer * 10 ** (18 - loanAssetDecimals);
            if (loanAssetDecimals > 18) _answer = _answer / 10 ** (loanAssetDecimals - 18);

            // Return the price of the LP asset in loan asset unit (mostly USDC)
            return Math.mulDiv(_price, 1e18, _answer);
        } else {
            revert("Invalid oracle ID");
        }
    }

    function _deployPersistently() internal virtual {
        vm.startPrank(DEPLOYER); // non-persistent account (`msg.sender` is by default)

        // Deploy the collateral token
        address collateral = address(new MockCollateralToken(config.curvePool));
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
        address coin0Oracle = address(new MockCurveOracle(config.sdOracleConfig.poolAssetFeeds[0]));
        vm.makePersistent(coin0Oracle);

        // Deploy the Curve Oracle implementation
        address curveOracle = address(
            deployCode("out/CurveLPOracleStable.vy/CurveLPOracleStable.json", abi.encode(config.curvePool, coin0Oracle))
        );
        vm.makePersistent(curveOracle);
        vm.stopPrank();

        // Push the oracles to the config structure
        config.oracles.push(Oracles({addr: stakeDAOOracle, path: _filename("/sd-stable"), id: OracleID.STAKEDAO}));
        config.oracles.push(Oracles({addr: curveOracle, path: _filename("/curve-stable"), id: OracleID.CURVE}));
    }

    function _filename(string memory key) internal view returns (string memory) {
        return string.concat("data/", config.directory, "/", key, ".json");
    }

    function _formatJSONData(uint256 price, uint256 currentBlock, bool isLastSnapshot)
        internal
        view
        returns (string memory data)
    {
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
            "}",
            isLastSnapshot ? "" : ","
        );
    }
}

contract MockCollateralToken {
    address private immutable POOL_ADDRESS;

    constructor(address poolAddress) {
        POOL_ADDRESS = poolAddress;
    }

    function decimals() external view returns (uint8) {
        return IERC20Metadata(POOL_ADDRESS).decimals();
    }
}

contract MockCurveOracle {
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
}

interface IFeed {
    function decimals() external view returns (uint8);
    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}
