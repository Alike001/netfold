// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Script, console2} from "forge-std/Script.sol";
import {NetFoldClearing} from "../src/NetFoldClearing.sol";

contract DeployNetFold is Script {
    uint256 internal constant ARBITRUM_SEPOLIA_CHAIN_ID = 421_614;
    address internal constant CANONICAL_USDG = 0xFFC95faa3d63Cde504a05B567C600B78C0b41892;

    error WrongChain(uint256 actualChainId);
    error InvalidSettlementToken(address token);

    function run() external returns (NetFoldClearing deployed) {
        if (block.chainid != ARBITRUM_SEPOLIA_CHAIN_ID) revert WrongChain(block.chainid);
        if (CANONICAL_USDG == address(0) || CANONICAL_USDG.code.length == 0) {
            revert InvalidSettlementToken(CANONICAL_USDG);
        }

        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("deployer", deployer);
        console2.log("chain id", block.chainid);
        console2.log("settlement token", CANONICAL_USDG);

        vm.startBroadcast(deployerPrivateKey);
        deployed = new NetFoldClearing(IERC20(CANONICAL_USDG));
        vm.stopBroadcast();

        console2.log("NetFoldClearing", address(deployed));
        console2.log("simulated/broadcast block", block.number);
        console2.log("transaction hash and receipt are recorded by Forge in broadcast/");
    }
}
