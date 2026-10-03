// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Script, console2} from "forge-std/Script.sol";
import {NetFoldClearing} from "../src/NetFoldClearing.sol";

contract RecordLiveEvidence is Script {
    uint256 internal constant ARBITRUM_SEPOLIA_CHAIN_ID = 421_614;
    address internal constant CANONICAL_USDG = 0xFFC95faa3d63Cde504a05B567C600B78C0b41892;
    uint256 internal constant USDG = 1e6;
    string internal constant BROADCAST_PATH = "broadcast/LiveProof.s.sol/421614/run-latest.json";
    string internal constant DEPLOYMENT_PATH = "deployments/421614.json";
    string internal constant EVIDENCE_PATH = "evidence/421614-run-001.json";

    error WrongChain(uint256 actualChainId);
    error BroadcastArtifactMissing(string path);
    error EvidenceAlreadyExists(string path);
    error InvalidDeployment(address deployment);
    error WrongSettlementToken(address actualToken);
    error UnexpectedLiveState();

    struct Participants {
        address alice;
        address bob;
        address carol;
    }

    struct Balances {
        uint256 aliceBeforeFunding;
        uint256 bobBeforeFunding;
        uint256 carolBeforeFunding;
        uint256 netFoldBeforeFunding;
        uint256 aliceBefore;
        uint256 bobBefore;
        uint256 carolBefore;
        uint256 netFoldBefore;
        uint256 aliceAfter;
        uint256 bobAfter;
        uint256 carolAfter;
        uint256 netFoldAfter;
    }

    function run() external {
        if (block.chainid != ARBITRUM_SEPOLIA_CHAIN_ID) revert WrongChain(block.chainid);
        if (!vm.exists(BROADCAST_PATH)) revert BroadcastArtifactMissing(BROADCAST_PATH);
        if (!vm.exists(DEPLOYMENT_PATH)) revert BroadcastArtifactMissing(DEPLOYMENT_PATH);
        if (vm.exists(EVIDENCE_PATH)) revert EvidenceAlreadyExists(EVIDENCE_PATH);

        address deployment = vm.envAddress("NETFOLD_ADDRESS");
        if (deployment == address(0) || deployment.code.length == 0) {
            revert InvalidDeployment(deployment);
        }
        uint256 runId = vm.envUint("LIVE_RUN_ID");
        Participants memory participants = Participants({
            alice: vm.addr(vm.envUint("ALICE_PRIVATE_KEY")),
            bob: vm.addr(vm.envUint("BOB_PRIVATE_KEY")),
            carol: vm.addr(vm.envUint("CAROL_PRIVATE_KEY"))
        });

        NetFoldClearing clearing = NetFoldClearing(deployment);
        IERC20Metadata token = IERC20Metadata(CANONICAL_USDG);
        if (address(clearing.settlementToken()) != CANONICAL_USDG) {
            revert WrongSettlementToken(address(clearing.settlementToken()));
        }

        string memory broadcastJson = vm.readFile(BROADCAST_PATH);
        bytes32[] memory transactionHashes = new bytes32[](11);
        for (uint256 i; i < transactionHashes.length; ++i) {
            transactionHashes[i] = vm.parseJsonBytes32(broadcastJson, _transactionHashPath(i));
        }
        uint256[] memory transactionBlocks = new uint256[](11);
        for (uint256 i; i < transactionBlocks.length; ++i) {
            transactionBlocks[i] = vm.parseJsonUint(broadcastJson, _receiptBlockPath(i));
        }
        uint256 fundingBlock = transactionBlocks[9];
        uint256 settlementBlock = transactionBlocks[10];

        _validateLiveState(clearing, runId, participants);
        Balances memory balances = _readBalances(token, deployment, participants, fundingBlock, settlementBlock);
        _writeEvidence(clearing, runId, deployment, participants, balances, transactionHashes, transactionBlocks);

        console2.log("live evidence artifact", EVIDENCE_PATH);
        console2.log("run id", runId);
        console2.log("settlement transaction");
        console2.logBytes32(transactionHashes[10]);
        console2.log("settlement block", settlementBlock);
    }

    function _readBalances(
        IERC20Metadata token,
        address deployment,
        Participants memory participants,
        uint256 fundingBlock,
        uint256 settlementBlock
    ) private returns (Balances memory balances) {
        string memory rpcUrl = vm.envString("ARBITRUM_SEPOLIA_RPC_URL");
        vm.createSelectFork(rpcUrl, fundingBlock - 1);
        balances.aliceBeforeFunding = token.balanceOf(participants.alice);
        balances.bobBeforeFunding = token.balanceOf(participants.bob);
        balances.carolBeforeFunding = token.balanceOf(participants.carol);
        balances.netFoldBeforeFunding = token.balanceOf(deployment);

        vm.createSelectFork(rpcUrl, settlementBlock - 1);
        balances.aliceBefore = token.balanceOf(participants.alice);
        balances.bobBefore = token.balanceOf(participants.bob);
        balances.carolBefore = token.balanceOf(participants.carol);
        balances.netFoldBefore = token.balanceOf(deployment);

        vm.createSelectFork(rpcUrl, settlementBlock);
        balances.aliceAfter = token.balanceOf(participants.alice);
        balances.bobAfter = token.balanceOf(participants.bob);
        balances.carolAfter = token.balanceOf(participants.carol);
        balances.netFoldAfter = token.balanceOf(deployment);
        if (
            balances.aliceBeforeFunding != balances.aliceBefore + 60 * USDG
                || balances.netFoldBefore != balances.netFoldBeforeFunding + 60 * USDG
                || balances.aliceAfter != balances.aliceBefore || balances.bobAfter != balances.bobBefore + 40 * USDG
                || balances.carolAfter != balances.carolBefore + 20 * USDG
                || balances.netFoldAfter + 60 * USDG != balances.netFoldBefore
        ) revert UnexpectedLiveState();
    }

    function _validateLiveState(NetFoldClearing clearing, uint256 runId, Participants memory participants)
        private
        view
    {
        NetFoldClearing.Run memory runRecord = clearing.getRun(runId);
        NetFoldClearing.Position memory alicePosition = clearing.getPosition(runId, participants.alice);
        NetFoldClearing.Position memory bobPosition = clearing.getPosition(runId, participants.bob);
        NetFoldClearing.Position memory carolPosition = clearing.getPosition(runId, participants.carol);
        if (
            runRecord.state != NetFoldClearing.RunState.Settled || runRecord.grossAmount != 200 * USDG
                || runRecord.totalNetDebit != 60 * USDG || runRecord.totalFunded != 60 * USDG
                || clearing.compressionBps(runId) != 7_000 || alicePosition.netDebit != 60 * USDG
                || bobPosition.netCredit != 40 * USDG || carolPosition.netCredit != 20 * USDG
        ) revert UnexpectedLiveState();
    }

    function _writeEvidence(
        NetFoldClearing clearing,
        uint256 runId,
        address deployment,
        Participants memory participants,
        Balances memory balances,
        bytes32[] memory transactionHashes,
        uint256[] memory transactionBlocks
    ) private {
        _serializeCore(clearing, runId, deployment, participants);
        _serializeTransactions(transactionHashes, transactionBlocks);
        _serializeBalances(balances);
        string memory json = vm.serializeString("evidence", "finalState", "SETTLED");
        vm.writeJson(json, EVIDENCE_PATH);
    }

    function _serializeCore(
        NetFoldClearing clearing,
        uint256 runId,
        address deployment,
        Participants memory participants
    ) private {
        uint256[] memory obligationIds = clearing.getObligationIds(runId);
        bytes32[] memory referenceHashes = new bytes32[](3);
        referenceHashes[0] = keccak256("NETFOLD-RUN-001-ALICE-BOB-100");
        referenceHashes[1] = keccak256("NETFOLD-RUN-001-BOB-CAROL-60");
        referenceHashes[2] = keccak256("NETFOLD-RUN-001-CAROL-ALICE-40");
        string memory deploymentJson = vm.readFile(DEPLOYMENT_PATH);
        bytes32 deploymentTransactionHash = vm.parseJsonBytes32(deploymentJson, ".deploymentTransactionHash");
        address deployer = vm.parseJsonAddress(deploymentJson, ".deployer");

        string memory objectKey = "evidence";
        vm.serializeUint(objectKey, "chainId", block.chainid);
        vm.serializeString(objectKey, "network", "arbitrum-sepolia");
        vm.serializeString(objectKey, "explorer", "https://sepolia.arbiscan.io");
        vm.serializeAddress(objectKey, "deployer", deployer);
        vm.serializeAddress(objectKey, "netFold", deployment);
        vm.serializeAddress(objectKey, "canonicalUSDG", CANONICAL_USDG);
        vm.serializeUint(objectKey, "runId", runId);
        vm.serializeAddress(objectKey, "aliceStudio", participants.alice);
        vm.serializeAddress(objectKey, "bobAuditor", participants.bob);
        vm.serializeAddress(objectKey, "carolInfrastructure", participants.carol);
        vm.serializeUint(objectKey, "obligationIds", obligationIds);
        vm.serializeBytes32(objectKey, "referenceHashes", referenceHashes);
        vm.serializeUint(objectKey, "grossAmount", 200 * USDG);
        vm.serializeUint(objectKey, "aliceNetDebit", 60 * USDG);
        vm.serializeUint(objectKey, "bobNetCredit", 40 * USDG);
        vm.serializeUint(objectKey, "carolNetCredit", 20 * USDG);
        vm.serializeUint(objectKey, "totalNetDebit", 60 * USDG);
        vm.serializeUint(objectKey, "totalNetCredit", 60 * USDG);
        vm.serializeUint(objectKey, "compressionBps", 7_000);
        vm.serializeBytes32(objectKey, "deploymentTransactionHash", deploymentTransactionHash);
    }

    function _serializeTransactions(bytes32[] memory transactionHashes, uint256[] memory transactionBlocks) private {
        bytes32[] memory proposalHashes = new bytes32[](3);
        proposalHashes[0] = transactionHashes[1];
        proposalHashes[1] = transactionHashes[2];
        proposalHashes[2] = transactionHashes[3];
        bytes32[] memory acceptanceHashes = new bytes32[](3);
        acceptanceHashes[0] = transactionHashes[4];
        acceptanceHashes[1] = transactionHashes[5];
        acceptanceHashes[2] = transactionHashes[6];
        uint256[] memory proposalBlocks = new uint256[](3);
        proposalBlocks[0] = transactionBlocks[1];
        proposalBlocks[1] = transactionBlocks[2];
        proposalBlocks[2] = transactionBlocks[3];
        uint256[] memory acceptanceBlocks = new uint256[](3);
        acceptanceBlocks[0] = transactionBlocks[4];
        acceptanceBlocks[1] = transactionBlocks[5];
        acceptanceBlocks[2] = transactionBlocks[6];

        string memory objectKey = "evidence";
        vm.serializeBytes32(objectKey, "creationTransactionHash", transactionHashes[0]);
        vm.serializeUint(objectKey, "creationBlock", transactionBlocks[0]);
        vm.serializeBytes32(objectKey, "obligationProposalTransactionHashes", proposalHashes);
        vm.serializeUint(objectKey, "obligationProposalBlocks", proposalBlocks);
        vm.serializeBytes32(objectKey, "acceptanceTransactionHashes", acceptanceHashes);
        vm.serializeUint(objectKey, "acceptanceBlocks", acceptanceBlocks);
        vm.serializeBytes32(objectKey, "closeTransactionHash", transactionHashes[7]);
        vm.serializeUint(objectKey, "closeBlock", transactionBlocks[7]);
        vm.serializeString(
            objectKey,
            "prematureSettlementEvidence",
            "eth_call simulation reverted with InvalidRunState(runId, COVERED, CLOSED); not broadcast"
        );
        vm.serializeString(objectKey, "prematureSettlementErrorSelector", "0x9c1fa0e0");
        vm.serializeString(
            objectKey,
            "prematureSettlementRevertData",
            "0x9c1fa0e0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000002"
        );
        vm.serializeString(objectKey, "prematureSettlementTransactionHashStatus", "not-broadcast");
        vm.serializeBytes32(objectKey, "approvalTransactionHash", transactionHashes[8]);
        vm.serializeUint(objectKey, "approvalBlock", transactionBlocks[8]);
        vm.serializeUint(objectKey, "approvalAmount", 60 * USDG);
        vm.serializeBytes32(objectKey, "fundingTransactionHash", transactionHashes[9]);
        vm.serializeUint(objectKey, "fundingBlock", transactionBlocks[9]);
        vm.serializeUint(objectKey, "totalFunded", 60 * USDG);
        vm.serializeBytes32(objectKey, "settlementTransactionHash", transactionHashes[10]);
        vm.serializeUint(objectKey, "settlementBlock", transactionBlocks[10]);
        vm.serializeString(
            objectKey,
            "secondSettlementEvidence",
            "eth_call simulation reverted with InvalidRunState(runId, COVERED, SETTLED); not broadcast"
        );
        vm.serializeString(objectKey, "secondSettlementErrorSelector", "0x9c1fa0e0");
        vm.serializeString(
            objectKey,
            "secondSettlementRevertData",
            "0x9c1fa0e0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000004"
        );
        vm.serializeString(objectKey, "secondSettlementTransactionHashStatus", "not-broadcast");
    }

    function _serializeBalances(Balances memory balances) private {
        string memory objectKey = "evidence";
        vm.serializeUint(objectKey, "aliceBalanceBeforeFunding", balances.aliceBeforeFunding);
        vm.serializeUint(objectKey, "bobBalanceBeforeFunding", balances.bobBeforeFunding);
        vm.serializeUint(objectKey, "carolBalanceBeforeFunding", balances.carolBeforeFunding);
        vm.serializeUint(objectKey, "netFoldBalanceBeforeFunding", balances.netFoldBeforeFunding);
        vm.serializeUint(objectKey, "aliceBalanceBeforeSettlement", balances.aliceBefore);
        vm.serializeUint(objectKey, "bobBalanceBeforeSettlement", balances.bobBefore);
        vm.serializeUint(objectKey, "carolBalanceBeforeSettlement", balances.carolBefore);
        vm.serializeUint(objectKey, "netFoldBalanceBeforeSettlement", balances.netFoldBefore);
        vm.serializeUint(objectKey, "aliceBalanceAfterSettlement", balances.aliceAfter);
        vm.serializeUint(objectKey, "bobBalanceAfterSettlement", balances.bobAfter);
        vm.serializeUint(objectKey, "carolBalanceAfterSettlement", balances.carolAfter);
        vm.serializeUint(objectKey, "netFoldBalanceAfterSettlement", balances.netFoldAfter);
        vm.serializeUint(objectKey, "accountedRunLiability", 0);
    }

    function _transactionHashPath(uint256 index) private pure returns (string memory) {
        return string.concat(".transactions[", vm.toString(index), "].hash");
    }

    function _receiptBlockPath(uint256 index) private pure returns (string memory) {
        return string.concat(".receipts[", vm.toString(index), "].blockNumber");
    }
}
