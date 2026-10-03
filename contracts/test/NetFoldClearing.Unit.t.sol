// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {NetFoldClearing} from "../src/NetFoldClearing.sol";
import {NetFoldFixture} from "./helpers/NetFoldFixture.sol";
import {MockUSDG} from "./mocks/MockUSDG.sol";

contract NetFoldClearingUnitTest is NetFoldFixture {
    function test_MockUSDGUsesSixDecimals() public view {
        assertEq(token.name(), "Mock USDG");
        assertEq(token.symbol(), "mUSDG");
        assertEq(token.decimals(), 6);
    }

    function test_CreateRunStoresParticipantsAndDeadline() public {
        uint64 deadline = uint64(block.timestamp + 1 days);
        uint256 runId = _createRun(deadline);

        NetFoldClearing.Run memory run = clearing.getRun(runId);
        assertEq(run.creator, creator);
        assertEq(uint256(run.state), uint256(NetFoldClearing.RunState.Open));
        assertEq(run.fundingDeadline, deadline);
        assertEq(run.participants.length, 3);
        assertTrue(clearing.isParticipant(runId, alice));
        assertTrue(clearing.isParticipant(runId, bob));
        assertTrue(clearing.isParticipant(runId, carol));
        assertEq(clearing.nextRunId(), 2);
    }

    function test_ProposeAndAcceptObligation() public {
        uint256 runId = _createRun(uint64(block.timestamp + 1 days));
        bytes32 referenceHash = keccak256("accepted-invoice");

        uint256 obligationId = _proposeAndAccept(runId, alice, bob, ALICE_TO_BOB, referenceHash);
        NetFoldClearing.Obligation memory obligation = clearing.getObligation(obligationId);

        assertEq(obligation.runId, runId);
        assertEq(obligation.payer, alice);
        assertEq(obligation.payee, bob);
        assertEq(obligation.amount, ALICE_TO_BOB);
        assertEq(obligation.referenceHash, referenceHash);
        assertEq(uint256(obligation.status), uint256(NetFoldClearing.ObligationStatus.Accepted));
        assertGt(obligation.acceptedAt, 0);
        assertTrue(clearing.usedReferenceHash(runId, referenceHash));
    }

    function test_CancelPendingObligationAndCloseWithAcceptedObligation() public {
        uint256 runId = _createRun(uint64(block.timestamp + 1 days));

        vm.prank(creator);
        uint256 cancelledId = clearing.proposeObligation(runId, alice, bob, 9 * USDG, keccak256("cancelled-invoice"));
        vm.prank(creator);
        clearing.cancelObligation(runId, cancelledId);
        _proposeAndAccept(runId, bob, carol, 7 * USDG, keccak256("active-invoice"));

        vm.prank(creator);
        clearing.closeRun(runId);

        NetFoldClearing.Obligation memory cancelled = clearing.getObligation(cancelledId);
        NetFoldClearing.Run memory run = clearing.getRun(runId);
        assertEq(uint256(cancelled.status), uint256(NetFoldClearing.ObligationStatus.Cancelled));
        assertEq(run.grossAmount, 7 * USDG);
        assertEq(run.totalNetDebit, 7 * USDG);
    }

    function test_ExactFixtureProvesNettingAndSeventyPercentCompression() public {
        uint256 runId = _closeFixture(uint64(block.timestamp + 1 days));
        NetFoldClearing.Run memory run = clearing.getRun(runId);
        NetFoldClearing.Position memory alicePosition = clearing.getPosition(runId, alice);
        NetFoldClearing.Position memory bobPosition = clearing.getPosition(runId, bob);
        NetFoldClearing.Position memory carolPosition = clearing.getPosition(runId, carol);

        assertEq(run.grossAmount, 200 * USDG);
        assertEq(run.totalNetDebit, 60 * USDG);
        assertEq(clearing.compressionBps(runId), 7_000);

        assertEq(alicePosition.grossPayable, 100 * USDG);
        assertEq(alicePosition.grossReceivable, 40 * USDG);
        assertEq(alicePosition.netDebit, 60 * USDG);
        assertEq(alicePosition.netCredit, 0);

        assertEq(bobPosition.grossPayable, 60 * USDG);
        assertEq(bobPosition.grossReceivable, 100 * USDG);
        assertEq(bobPosition.netDebit, 0);
        assertEq(bobPosition.netCredit, 40 * USDG);

        assertEq(carolPosition.grossPayable, 40 * USDG);
        assertEq(carolPosition.grossReceivable, 60 * USDG);
        assertEq(carolPosition.netDebit, 0);
        assertEq(carolPosition.netCredit, 20 * USDG);
    }

    function test_FundPullsEntireFinalizedDebitAndCoversRun() public {
        uint256 runId = _closeFixture(uint64(block.timestamp + 1 days));
        _fund(alice, runId, 60 * USDG);

        NetFoldClearing.Run memory run = clearing.getRun(runId);
        NetFoldClearing.Position memory position = clearing.getPosition(runId, alice);
        assertEq(position.funded, 60 * USDG);
        assertEq(run.totalFunded, 60 * USDG);
        assertEq(clearing.requiredFunding(runId, alice), 0);
        assertEq(clearing.totalEscrowed(), 60 * USDG);
        assertEq(token.balanceOf(address(clearing)), 60 * USDG);
        assertEq(uint256(run.state), uint256(NetFoldClearing.RunState.Covered));
    }

    function test_SettleAtomicallyPaysEveryNetCreditor() public {
        uint256 runId = _closeFixture(uint64(block.timestamp + 1 days));
        _fund(alice, runId, 60 * USDG);

        vm.prank(outsider);
        clearing.settleRun(runId);

        NetFoldClearing.Run memory run = clearing.getRun(runId);
        assertEq(uint256(run.state), uint256(NetFoldClearing.RunState.Settled));
        assertEq(token.balanceOf(bob), 40 * USDG);
        assertEq(token.balanceOf(carol), 20 * USDG);
        assertEq(token.balanceOf(address(clearing)), 0);
        assertEq(clearing.totalEscrowed(), 0);
        assertGt(run.settledAt, 0);
    }

    function test_SettlementTransferFailureRollsBackEveryPayoutAndStateChange() public {
        uint256 runId = _closeFixture(uint64(block.timestamp + 1 days));
        _fund(alice, runId, 60 * USDG);
        token.setBlockedRecipient(carol);

        vm.expectRevert(abi.encodeWithSelector(MockUSDG.BlockedRecipient.selector, carol));
        clearing.settleRun(runId);

        NetFoldClearing.Run memory run = clearing.getRun(runId);
        assertEq(uint256(run.state), uint256(NetFoldClearing.RunState.Covered));
        assertEq(token.balanceOf(bob), 0);
        assertEq(token.balanceOf(carol), 0);
        assertEq(token.balanceOf(address(clearing)), 60 * USDG);
        assertEq(clearing.totalEscrowed(), 60 * USDG);

        token.setBlockedRecipient(address(0));
        clearing.settleRun(runId);
        assertEq(token.balanceOf(bob), 40 * USDG);
        assertEq(token.balanceOf(carol), 20 * USDG);
    }

    function test_ZeroNetDebitRunIsCoveredOnCloseAndSettlesWithoutFunding() public {
        uint256 runId = _createRun(uint64(block.timestamp + 1 days));
        _proposeAndAccept(runId, alice, bob, 10 * USDG, keccak256("circle-a"));
        _proposeAndAccept(runId, bob, carol, 10 * USDG, keccak256("circle-b"));
        _proposeAndAccept(runId, carol, alice, 10 * USDG, keccak256("circle-c"));

        vm.prank(creator);
        clearing.closeRun(runId);
        assertEq(uint256(clearing.getRun(runId).state), uint256(NetFoldClearing.RunState.Covered));
        assertEq(clearing.getRun(runId).totalNetDebit, 0);

        clearing.settleRun(runId);
        assertEq(uint256(clearing.getRun(runId).state), uint256(NetFoldClearing.RunState.Settled));
        assertEq(token.balanceOf(address(clearing)), 0);
    }

    function test_ExpireWithoutFundingCompletesAsRefunded() public {
        uint64 deadline = uint64(block.timestamp + 1 days);
        uint256 runId = _closeFixture(deadline);

        vm.warp(deadline);
        clearing.expireRun(runId);

        NetFoldClearing.Run memory run = clearing.getRun(runId);
        assertEq(uint256(run.state), uint256(NetFoldClearing.RunState.Refunded));
        assertEq(run.totalFunded, 0);
        assertEq(run.totalRefunded, 0);
        assertEq(clearing.totalEscrowed(), 0);
    }

    function test_ExpiredIncompleteRunRefundsExactFundedDebtorAmount() public {
        uint64 deadline = uint64(block.timestamp + 1 days);
        uint256 runId = _createRun(deadline);
        _proposeAndAccept(runId, alice, carol, 50 * USDG, keccak256("alice-debit"));
        _proposeAndAccept(runId, bob, carol, 30 * USDG, keccak256("bob-debit"));
        vm.prank(creator);
        clearing.closeRun(runId);

        _fund(alice, runId, 50 * USDG);
        assertEq(uint256(clearing.getRun(runId).state), uint256(NetFoldClearing.RunState.Closed));

        vm.warp(deadline);
        clearing.expireRun(runId);
        assertEq(uint256(clearing.getRun(runId).state), uint256(NetFoldClearing.RunState.Expired));

        vm.prank(alice);
        clearing.claimRefund(runId);

        NetFoldClearing.Run memory run = clearing.getRun(runId);
        NetFoldClearing.Position memory alicePosition = clearing.getPosition(runId, alice);
        assertEq(uint256(run.state), uint256(NetFoldClearing.RunState.Refunded));
        assertEq(run.totalFunded, 50 * USDG);
        assertEq(run.totalRefunded, 50 * USDG);
        assertEq(alicePosition.funded, 50 * USDG);
        assertEq(alicePosition.refunded, 50 * USDG);
        assertEq(token.balanceOf(alice), 50 * USDG);
        assertEq(token.balanceOf(address(clearing)), 0);
        assertEq(clearing.totalEscrowed(), 0);
    }

    function test_CancelOpenRun() public {
        uint256 runId = _createAcceptedFixture(uint64(block.timestamp + 1 days));
        vm.prank(creator);
        clearing.cancelRun(runId);

        assertEq(uint256(clearing.getRun(runId).state), uint256(NetFoldClearing.RunState.Cancelled));
    }
}
