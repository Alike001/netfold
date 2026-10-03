// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {NetFoldClearing} from "../src/NetFoldClearing.sol";

contract RecordDeployment is Script {
    uint256 internal constant ARBITRUM_SEPOLIA_CHAIN_ID = 421_614;
    address internal constant CANONICAL_USDG = 0xFFC95faa3d63Cde504a05B567C600B78C0b41892;
    string internal constant BROADCAST_PATH = "broadcast/DeployNetFold.s.sol/421614/run-latest.json";
    string internal constant ARTIFACT_PATH = "deployments/421614.json";

    error WrongChain(uint256 actualChainId);
    error BroadcastArtifactMissing(string path);
    error EvidenceAlreadyExists(string path);
    error InvalidDeployment(address deployment);
    error WrongSettlementToken(address actualToken);

    function run() external {
        if (block.chainid != ARBITRUM_SEPOLIA_CHAIN_ID) revert WrongChain(block.chainid);
        if (!vm.exists(BROADCAST_PATH)) revert BroadcastArtifactMissing(BROADCAST_PATH);
        if (vm.exists(ARTIFACT_PATH)) revert EvidenceAlreadyExists(ARTIFACT_PATH);

        string memory broadcastJson = vm.readFile(BROADCAST_PATH);
        address deployment = vm.parseJsonAddress(broadcastJson, ".transactions[0].contractAddress");
        bytes32 transactionHash = vm.parseJsonBytes32(broadcastJson, ".transactions[0].hash");
        uint256 deploymentBlock = vm.parseJsonUint(broadcastJson, ".receipts[0].blockNumber");
        if (deployment == address(0) || deployment.code.length == 0) {
            revert InvalidDeployment(deployment);
        }

        NetFoldClearing clearing = NetFoldClearing(deployment);
        if (address(clearing.settlementToken()) != CANONICAL_USDG) {
            revert WrongSettlementToken(address(clearing.settlementToken()));
        }

        address deployer = vm.addr(vm.envUint("DEPLOYER_PRIVATE_KEY"));
        string memory verificationStatus = vm.envOr("SOURCE_VERIFICATION_STATUS", string("pending"));
        string memory objectKey = "deployment";
        vm.serializeUint(objectKey, "chainId", block.chainid);
        vm.serializeString(objectKey, "network", "arbitrum-sepolia");
        vm.serializeString(objectKey, "explorer", "https://sepolia.arbiscan.io");
        vm.serializeAddress(objectKey, "deployer", deployer);
        vm.serializeAddress(objectKey, "netFold", deployment);
        vm.serializeAddress(objectKey, "settlementToken", CANONICAL_USDG);
        vm.serializeBytes32(objectKey, "deploymentTransactionHash", transactionHash);
        vm.serializeUint(objectKey, "deploymentBlock", deploymentBlock);
        string memory json = vm.serializeString(objectKey, "sourceVerificationStatus", verificationStatus);
        vm.writeJson(json, ARTIFACT_PATH);

        console2.log("deployment artifact", ARTIFACT_PATH);
        console2.log("NetFoldClearing", deployment);
        console2.log("deployment transaction");
        console2.logBytes32(transactionHash);
        console2.log("deployment block", deploymentBlock);
        console2.log("source verification", verificationStatus);
    }
}
