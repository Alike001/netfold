// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {NetFoldClearing} from "../src/NetFoldClearing.sol";
import {NetFoldFixture} from "./helpers/NetFoldFixture.sol";
import {NetFoldHandler} from "./handlers/NetFoldHandler.sol";

contract NetFoldClearingInvariantTest is NetFoldFixture {
    NetFoldHandler internal handler;
    uint256 internal settlementRunId;
    uint256 internal refundRunId;

    address internal refundAlice;
    address internal refundBob;
    address internal refundCarol;
    address internal refundCreditor;

    function setUp() public override {
        super.setUp();

        settlementRunId = _closeFixture(uint64(block.timestamp + 30 days));
        token.mint(alice, 60 * USDG);
        vm.prank(alice);
        token.approve(address(clearing), type(uint256).max);

        refundAlice = makeAddr("refund-alice");
        refundBob = makeAddr("refund-bob");
        refundCarol = makeAddr("refund-carol");
        refundCreditor = makeAddr("refund-creditor");
        address[] memory refundParticipants = new address[](4);
        refundParticipants[0] = refundAlice;
        refundParticipants[1] = refundBob;
        refundParticipants[2] = refundCarol;
        refundParticipants[3] = refundCreditor;
        uint64 refundDeadline = uint64(block.timestamp + 1 days);

        vm.prank(creator);
        refundRunId = clearing.createRun(refundParticipants, refundDeadline);
        _proposeAndAccept(refundRunId, refundAlice, refundCreditor, 50 * USDG, keccak256("invariant-refund-a"));
        _proposeAndAccept(refundRunId, refundBob, refundCreditor, 30 * USDG, keccak256("invariant-refund-b"));
        _proposeAndAccept(refundRunId, refundCarol, refundCreditor, 20 * USDG, keccak256("invariant-refund-c"));
        vm.prank(creator);
        clearing.closeRun(refundRunId);

        token.mint(refundAlice, 50 * USDG);
        token.mint(refundBob, 30 * USDG);
        vm.prank(refundAlice);
        token.approve(address(clearing), type(uint256).max);
        vm.prank(refundBob);
        token.approve(address(clearing), type(uint256).max);

        handler = new NetFoldHandler(
            clearing, token, settlementRunId, refundRunId, refundDeadline, alice, refundAlice, refundBob
        );
        targetContract(address(handler));
    }

    function invariant_ContractIsSolventForAllAccountedEscrow() public view {
        assertEq(token.balanceOf(address(clearing)), clearing.totalEscrowed());
        assertEq(clearing.totalEscrowed(), handler.ghostFunded() - handler.ghostPaid() - handler.ghostRefunded());
    }

    function invariant_ClosedRunDebitsEqualCreditsAndDoNotExceedGross() public view {
        _assertRunConservation(settlementRunId);
        _assertRunConservation(refundRunId);
    }

    function invariant_FundingIsAlwaysZeroOrTheCompleteNetDebit() public view {
        _assertExactFunding(settlementRunId, alice);
        _assertExactFunding(refundRunId, refundAlice);
        _assertExactFunding(refundRunId, refundBob);
        _assertExactFunding(refundRunId, refundCarol);
    }

    function invariant_SettlementRequiresCoverageAndOccursAtMostOnce() public view {
        NetFoldClearing.Run memory run = clearing.getRun(settlementRunId);
        if (run.state == NetFoldClearing.RunState.Settled) {
            assertEq(run.totalFunded, run.totalNetDebit);
            assertEq(handler.ghostPaid(), run.totalNetDebit);
            assertEq(token.balanceOf(bob), 40 * USDG);
            assertEq(token.balanceOf(carol), 20 * USDG);
        }
        assertLe(handler.ghostSettlementCalls(), 1);
    }

    function invariant_CompletedRefundsReturnAllFundedValue() public view {
        NetFoldClearing.Run memory run = clearing.getRun(refundRunId);
        if (run.state == NetFoldClearing.RunState.Refunded) {
            assertEq(run.totalRefunded, run.totalFunded);
        }
        assertLe(handler.ghostRefundCompletionCalls(), 1);
    }

    function _assertRunConservation(uint256 runId) private view {
        NetFoldClearing.Run memory run = clearing.getRun(runId);
        address[] memory participants = clearing.getParticipants(runId);
        uint256 totalDebit;
        uint256 totalCredit;
        for (uint256 i; i < participants.length; ++i) {
            NetFoldClearing.Position memory position = clearing.getPosition(runId, participants[i]);
            totalDebit += position.netDebit;
            totalCredit += position.netCredit;
        }
        assertEq(totalDebit, totalCredit);
        assertEq(totalDebit, run.totalNetDebit);
        assertLe(run.totalNetDebit, run.grossAmount);
    }

    function _assertExactFunding(uint256 runId, address debtor) private view {
        NetFoldClearing.Position memory position = clearing.getPosition(runId, debtor);
        assertTrue(position.funded == 0 || position.funded == position.netDebit);
        assertLe(position.refunded, position.funded);
    }
}
