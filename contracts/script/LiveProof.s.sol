// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Script, console2} from "forge-std/Script.sol";
import {NetFoldClearing} from "../src/NetFoldClearing.sol";

contract LiveProof is Script {
    uint256 internal constant ARBITRUM_SEPOLIA_CHAIN_ID = 421_614;
    address internal constant CANONICAL_USDG = 0xFFC95faa3d63Cde504a05B567C600B78C0b41892;
    uint256 internal constant USDG = 1e6;
    uint256 internal constant ALICE_TO_BOB = 100 * USDG;
    uint256 internal constant BOB_TO_CAROL = 60 * USDG;
    uint256 internal constant CAROL_TO_ALICE = 40 * USDG;

    error WrongChain(uint256 actualChainId);
    error InvalidDeployment(address deployment);
    error WrongSettlementToken(address actualToken);
    error DuplicateParticipant(address participant);
    error UnexpectedAccounting();
    error ExpectedRevertDidNotOccur(bytes4 selector);
    error InsufficientAliceUSDG(uint256 actualBalance);
    error ApprovalFailed();
    error InvalidRunDuration(uint256 duration);

    struct LiveConfig {
        NetFoldClearing clearing;
        IERC20Metadata token;
        uint256 alicePrivateKey;
        uint256 bobPrivateKey;
        uint256 carolPrivateKey;
        address alice;
        address bob;
        address carol;
    }

    struct LiveIds {
        uint256 runId;
        uint256 aliceObligationId;
        uint256 bobObligationId;
        uint256 carolObligationId;
    }

    struct SettlementBalances {
        uint256 aliceBefore;
        uint256 bobBefore;
        uint256 carolBefore;
    }

    function run() external {
        if (block.chainid != ARBITRUM_SEPOLIA_CHAIN_ID) revert WrongChain(block.chainid);
        LiveConfig memory config = _loadConfig();
        uint256 aliceStartingBalance = config.token.balanceOf(config.alice);
        if (aliceStartingBalance < 60 * USDG) revert InsufficientAliceUSDG(aliceStartingBalance);

        LiveIds memory ids = _createAndClose(config);
        _assertClosedAccounting(config.clearing, ids.runId, config.alice, config.bob, config.carol);
        _confirmSettlementReverts(config.clearing, ids.runId, NetFoldClearing.RunState.Closed);
        SettlementBalances memory balances = _fundAndSettle(config, ids.runId);
        _confirmSettlementReverts(config.clearing, ids.runId, NetFoldClearing.RunState.Settled);

        _printReport(config, ids, balances, aliceStartingBalance);
    }

    function _loadConfig() private view returns (LiveConfig memory config) {
        address deployment = vm.envAddress("NETFOLD_ADDRESS");
        if (deployment == address(0) || deployment.code.length == 0) {
            revert InvalidDeployment(deployment);
        }

        config.clearing = NetFoldClearing(deployment);
        config.token = IERC20Metadata(CANONICAL_USDG);
        config.alicePrivateKey = vm.envUint("ALICE_PRIVATE_KEY");
        config.bobPrivateKey = vm.envUint("BOB_PRIVATE_KEY");
        config.carolPrivateKey = vm.envUint("CAROL_PRIVATE_KEY");
        config.alice = vm.addr(config.alicePrivateKey);
        config.bob = vm.addr(config.bobPrivateKey);
        config.carol = vm.addr(config.carolPrivateKey);
        _requireDistinct(config.alice, config.bob, config.carol);

        if (address(config.clearing.settlementToken()) != CANONICAL_USDG) {
            revert WrongSettlementToken(address(config.clearing.settlementToken()));
        }
    }

    function _createAndClose(LiveConfig memory config) private returns (LiveIds memory ids) {
        address[] memory participants = new address[](3);
        participants[0] = config.alice;
        participants[1] = config.bob;
        participants[2] = config.carol;
        uint256 duration = vm.envOr("RUN_DURATION_SECONDS", uint256(7 days));
        if (duration == 0 || duration > type(uint64).max - block.timestamp) {
            revert InvalidRunDuration(duration);
        }
        uint64 deadline = uint64(block.timestamp + duration);

        vm.startBroadcast(config.alicePrivateKey);
        ids.runId = config.clearing.createRun(participants, deadline);
        ids.aliceObligationId = config.clearing
            .proposeObligation(
                ids.runId, config.alice, config.bob, ALICE_TO_BOB, keccak256("NETFOLD-RUN-001-ALICE-BOB-100")
            );
        ids.bobObligationId = config.clearing
            .proposeObligation(
                ids.runId, config.bob, config.carol, BOB_TO_CAROL, keccak256("NETFOLD-RUN-001-BOB-CAROL-60")
            );
        ids.carolObligationId = config.clearing
            .proposeObligation(
                ids.runId, config.carol, config.alice, CAROL_TO_ALICE, keccak256("NETFOLD-RUN-001-CAROL-ALICE-40")
            );
        config.clearing.acceptObligation(ids.runId, ids.aliceObligationId);
        vm.stopBroadcast();

        vm.startBroadcast(config.bobPrivateKey);
        config.clearing.acceptObligation(ids.runId, ids.bobObligationId);
        vm.stopBroadcast();

        vm.startBroadcast(config.carolPrivateKey);
        config.clearing.acceptObligation(ids.runId, ids.carolObligationId);
        vm.stopBroadcast();

        vm.startBroadcast(config.alicePrivateKey);
        config.clearing.closeRun(ids.runId);
        vm.stopBroadcast();
    }

    function _fundAndSettle(LiveConfig memory config, uint256 runId)
        private
        returns (SettlementBalances memory balances)
    {
        vm.startBroadcast(config.alicePrivateKey);
        if (!config.token.approve(address(config.clearing), 60 * USDG)) revert ApprovalFailed();
        config.clearing.fund(runId);
        vm.stopBroadcast();

        NetFoldClearing.Run memory coveredRun = config.clearing.getRun(runId);
        if (coveredRun.state != NetFoldClearing.RunState.Covered) revert UnexpectedAccounting();

        balances.aliceBefore = config.token.balanceOf(config.alice);
        balances.bobBefore = config.token.balanceOf(config.bob);
        balances.carolBefore = config.token.balanceOf(config.carol);

        vm.startBroadcast(config.alicePrivateKey);
        config.clearing.settleRun(runId);
        vm.stopBroadcast();

        _assertSettled(
            config.clearing,
            config.token,
            runId,
            config.alice,
            config.bob,
            config.carol,
            balances.aliceBefore,
            balances.bobBefore,
            balances.carolBefore
        );
    }

    function _printReport(
        LiveConfig memory config,
        LiveIds memory ids,
        SettlementBalances memory balances,
        uint256 aliceStartingBalance
    ) private view {
        console2.log("LIVE PROOF COMPLETE");
        console2.log("run id", ids.runId);
        console2.log("Alice / Studio", config.alice);
        console2.log("Bob / Auditor", config.bob);
        console2.log("Carol / Infrastructure", config.carol);
        console2.log("Alice obligation id", ids.aliceObligationId);
        console2.log("Bob obligation id", ids.bobObligationId);
        console2.log("Carol obligation id", ids.carolObligationId);
        console2.log("gross units", 200 * USDG);
        console2.log("net debit units", 60 * USDG);
        console2.log("compression bps", uint256(7_000));
        console2.log("Alice starting USDG", aliceStartingBalance);
        console2.log("Alice before settlement", balances.aliceBefore);
        console2.log("Bob before settlement", balances.bobBefore);
        console2.log("Carol before settlement", balances.carolBefore);
        console2.log("Alice ending USDG", config.token.balanceOf(config.alice));
        console2.log("Bob ending USDG", config.token.balanceOf(config.bob));
        console2.log("Carol ending USDG", config.token.balanceOf(config.carol));
        console2.log("transaction hashes and receipts are recorded by Forge in broadcast/");
    }

    function _assertClosedAccounting(NetFoldClearing clearing, uint256 runId, address alice, address bob, address carol)
        private
        view
    {
        NetFoldClearing.Run memory runRecord = clearing.getRun(runId);
        NetFoldClearing.Position memory alicePosition = clearing.getPosition(runId, alice);
        NetFoldClearing.Position memory bobPosition = clearing.getPosition(runId, bob);
        NetFoldClearing.Position memory carolPosition = clearing.getPosition(runId, carol);
        if (
            runRecord.state != NetFoldClearing.RunState.Closed || runRecord.grossAmount != 200 * USDG
                || runRecord.totalNetDebit != 60 * USDG || clearing.compressionBps(runId) != 7_000
                || alicePosition.netDebit != 60 * USDG || bobPosition.netCredit != 40 * USDG
                || carolPosition.netCredit != 20 * USDG
        ) revert UnexpectedAccounting();
    }

    function _assertSettled(
        NetFoldClearing clearing,
        IERC20Metadata token,
        uint256 runId,
        address alice,
        address bob,
        address carol,
        uint256 aliceBefore,
        uint256 bobBefore,
        uint256 carolBefore
    ) private view {
        NetFoldClearing.Run memory runRecord = clearing.getRun(runId);
        if (
            runRecord.state != NetFoldClearing.RunState.Settled || clearing.totalEscrowed() != 0
                || token.balanceOf(alice) != aliceBefore || token.balanceOf(bob) != bobBefore + 40 * USDG
                || token.balanceOf(carol) != carolBefore + 20 * USDG
        ) revert UnexpectedAccounting();
    }

    function _confirmSettlementReverts(NetFoldClearing clearing, uint256 runId, NetFoldClearing.RunState actualState)
        private
    {
        (bool success, bytes memory revertData) =
            address(clearing).call(abi.encodeCall(NetFoldClearing.settleRun, (runId)));
        if (success) revert ExpectedRevertDidNotOccur(NetFoldClearing.settleRun.selector);
        bytes memory expectedRevert = abi.encodeWithSelector(
            NetFoldClearing.InvalidRunState.selector, runId, NetFoldClearing.RunState.Covered, actualState
        );
        if (keccak256(revertData) != keccak256(expectedRevert)) revert UnexpectedAccounting();
    }

    function _requireDistinct(address alice, address bob, address carol) private pure {
        if (alice == bob || alice == carol) revert DuplicateParticipant(alice);
        if (bob == carol) revert DuplicateParticipant(bob);
    }
}
