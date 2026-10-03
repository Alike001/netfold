// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {NetFoldClearing} from "../src/NetFoldClearing.sol";
import {NetFoldFixture} from "./helpers/NetFoldFixture.sol";

contract NetFoldClearingFailureTest is NetFoldFixture {
    function test_RevertConstructorWithZeroOrNonContractToken() public {
        vm.expectRevert(NetFoldClearing.InvalidSettlementToken.selector);
        new NetFoldClearing(IERC20(address(0)));

        vm.expectRevert(NetFoldClearing.InvalidSettlementToken.selector);
        new NetFoldClearing(IERC20(alice));
    }

    function test_RevertCreateRunOutsideParticipantBounds() public {
        address[] memory one = new address[](1);
        one[0] = alice;
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.InvalidParticipantCount.selector, 1));
        clearing.createRun(one, uint64(block.timestamp + 1 days));

        address[] memory nine = new address[](9);
        for (uint256 i; i < nine.length; ++i) {
            nine[i] = address(uint160(i + 1));
        }
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.InvalidParticipantCount.selector, 9));
        clearing.createRun(nine, uint64(block.timestamp + 1 days));
    }

    function test_RevertCreateRunWithZeroOrDuplicateParticipant() public {
        address[] memory participants = _participants();
        participants[1] = address(0);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.InvalidParticipant.selector, address(0)));
        clearing.createRun(participants, uint64(block.timestamp + 1 days));

        participants[1] = alice;
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.DuplicateParticipant.selector, alice));
        clearing.createRun(participants, uint64(block.timestamp + 1 days));
    }

    function test_RevertCreateRunWithPastDeadline() public {
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.InvalidDeadline.selector, block.timestamp));
        clearing.createRun(_participants(), uint64(block.timestamp));
    }

    function test_RevertProposeUnlessCreatorAndOpen() public {
        uint256 runId = _createRun(uint64(block.timestamp + 1 days));
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.NotRunCreator.selector, runId, alice));
        clearing.proposeObligation(runId, alice, bob, USDG, keccak256("unauthorized"));

        vm.prank(creator);
        clearing.cancelRun(runId);
        vm.prank(creator);
        vm.expectRevert(
            abi.encodeWithSelector(
                NetFoldClearing.InvalidRunState.selector,
                runId,
                NetFoldClearing.RunState.Open,
                NetFoldClearing.RunState.Cancelled
            )
        );
        clearing.proposeObligation(runId, alice, bob, USDG, keccak256("closed"));
    }

    function test_RevertProposeWithInvalidPartiesAmountOrReference() public {
        uint256 runId = _createRun(uint64(block.timestamp + 1 days));

        vm.startPrank(creator);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.NotParticipant.selector, runId, outsider));
        clearing.proposeObligation(runId, outsider, bob, USDG, keccak256("outsider-payer"));

        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.NotParticipant.selector, runId, outsider));
        clearing.proposeObligation(runId, alice, outsider, USDG, keccak256("outsider-payee"));

        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.InvalidObligationParties.selector, alice, alice));
        clearing.proposeObligation(runId, alice, alice, USDG, keccak256("self"));

        vm.expectRevert(NetFoldClearing.ZeroAmount.selector);
        clearing.proposeObligation(runId, alice, bob, 0, keccak256("zero"));

        uint256 tooLarge = uint256(type(uint128).max) + 1;
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.AmountTooLarge.selector, tooLarge));
        clearing.proposeObligation(runId, alice, bob, tooLarge, keccak256("too-large"));

        vm.expectRevert(NetFoldClearing.InvalidReferenceHash.selector);
        clearing.proposeObligation(runId, alice, bob, USDG, bytes32(0));
        vm.stopPrank();
    }

    function test_RevertDuplicateReferenceEvenAfterCancellation() public {
        uint256 runId = _createRun(uint64(block.timestamp + 1 days));
        bytes32 referenceHash = keccak256("duplicate-reference");
        vm.prank(creator);
        uint256 obligationId = clearing.proposeObligation(runId, alice, bob, USDG, referenceHash);
        vm.prank(creator);
        clearing.cancelObligation(runId, obligationId);

        vm.prank(creator);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.DuplicateReferenceHash.selector, runId, referenceHash));
        clearing.proposeObligation(runId, alice, bob, USDG, referenceHash);
    }

    function test_RevertThirtyThirdObligation() public {
        uint256 runId = _createRun(uint64(block.timestamp + 1 days));
        vm.startPrank(creator);
        for (uint256 i; i < 32; ++i) {
            clearing.proposeObligation(runId, alice, bob, USDG, keccak256(abi.encode("bounded", i)));
        }
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.TooManyObligations.selector, runId));
        clearing.proposeObligation(runId, alice, bob, USDG, keccak256("thirty-third"));
        vm.stopPrank();
    }

    function test_RevertMutationAtOrAfterDeadline() public {
        uint64 deadline = uint64(block.timestamp + 1 days);
        uint256 runId = _createRun(deadline);
        vm.prank(creator);
        uint256 obligationId = clearing.proposeObligation(runId, alice, bob, USDG, keccak256("deadline-obligation"));
        vm.warp(deadline);

        vm.prank(creator);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.FundingDeadlineReached.selector, runId, deadline));
        clearing.proposeObligation(runId, bob, carol, USDG, keccak256("late-proposal"));

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.FundingDeadlineReached.selector, runId, deadline));
        clearing.acceptObligation(runId, obligationId);

        vm.prank(creator);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.FundingDeadlineReached.selector, runId, deadline));
        clearing.cancelObligation(runId, obligationId);

        vm.prank(creator);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.FundingDeadlineReached.selector, runId, deadline));
        clearing.closeRun(runId);
    }

    function test_RevertAcceptByNonPayerOrTwice() public {
        uint256 runId = _createRun(uint64(block.timestamp + 1 days));
        vm.prank(creator);
        uint256 obligationId = clearing.proposeObligation(runId, alice, bob, USDG, keccak256("acceptance"));

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.NotObligationPayer.selector, obligationId, bob));
        clearing.acceptObligation(runId, obligationId);

        vm.prank(alice);
        clearing.acceptObligation(runId, obligationId);
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                NetFoldClearing.InvalidObligationStatus.selector,
                obligationId,
                NetFoldClearing.ObligationStatus.Pending,
                NetFoldClearing.ObligationStatus.Accepted
            )
        );
        clearing.acceptObligation(runId, obligationId);
    }

    function test_RevertAcceptObligationFromDifferentRun() public {
        uint256 firstRun = _createRun(uint64(block.timestamp + 1 days));
        uint256 secondRun = _createRun(uint64(block.timestamp + 1 days));
        vm.prank(creator);
        uint256 obligationId = clearing.proposeObligation(firstRun, alice, bob, USDG, keccak256("wrong-run"));

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.ObligationNotFound.selector, obligationId));
        clearing.acceptObligation(secondRun, obligationId);
    }

    function test_RevertCancelAcceptedObligationOrByNonCreator() public {
        uint256 runId = _createRun(uint64(block.timestamp + 1 days));
        vm.prank(creator);
        uint256 obligationId = clearing.proposeObligation(runId, alice, bob, USDG, keccak256("cancel-rules"));

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.NotRunCreator.selector, runId, alice));
        clearing.cancelObligation(runId, obligationId);

        vm.prank(alice);
        clearing.acceptObligation(runId, obligationId);
        vm.prank(creator);
        vm.expectRevert(
            abi.encodeWithSelector(
                NetFoldClearing.InvalidObligationStatus.selector,
                obligationId,
                NetFoldClearing.ObligationStatus.Pending,
                NetFoldClearing.ObligationStatus.Accepted
            )
        );
        clearing.cancelObligation(runId, obligationId);
    }

    function test_RevertCloseWithoutAcceptedActiveObligation() public {
        uint256 emptyRun = _createRun(uint64(block.timestamp + 1 days));
        vm.prank(creator);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.NoObligations.selector, emptyRun));
        clearing.closeRun(emptyRun);

        uint256 pendingRun = _createRun(uint64(block.timestamp + 1 days));
        vm.prank(creator);
        uint256 pendingId = clearing.proposeObligation(pendingRun, alice, bob, USDG, keccak256("pending-close"));
        vm.prank(creator);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.UnacceptedObligation.selector, pendingId));
        clearing.closeRun(pendingRun);

        vm.prank(creator);
        clearing.cancelObligation(pendingRun, pendingId);
        vm.prank(creator);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.NoObligations.selector, pendingRun));
        clearing.closeRun(pendingRun);
    }

    function test_RevertCloseOrCancelRunByNonCreatorAndAfterClose() public {
        uint256 runId = _createAcceptedFixture(uint64(block.timestamp + 1 days));
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.NotRunCreator.selector, runId, alice));
        clearing.closeRun(runId);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.NotRunCreator.selector, runId, alice));
        clearing.cancelRun(runId);

        vm.prank(creator);
        clearing.closeRun(runId);
        vm.prank(creator);
        vm.expectRevert(
            abi.encodeWithSelector(
                NetFoldClearing.InvalidRunState.selector,
                runId,
                NetFoldClearing.RunState.Open,
                NetFoldClearing.RunState.Closed
            )
        );
        clearing.cancelRun(runId);
    }

    function test_RevertFundBeforeCloseByCreditorWithoutAllowanceOrAfterDeadline() public {
        uint64 deadline = uint64(block.timestamp + 1 days);
        uint256 openRun = _createAcceptedFixture(deadline);
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                NetFoldClearing.InvalidRunState.selector,
                openRun,
                NetFoldClearing.RunState.Closed,
                NetFoldClearing.RunState.Open
            )
        );
        clearing.fund(openRun);

        vm.prank(creator);
        clearing.closeRun(openRun);
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.NoFundingRequired.selector, openRun, bob));
        clearing.fund(openRun);

        token.mint(alice, 60 * USDG);
        vm.prank(alice);
        vm.expectRevert();
        clearing.fund(openRun);

        vm.warp(deadline);
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.FundingDeadlineReached.selector, openRun, deadline));
        clearing.fund(openRun);
    }

    function test_RevertFundSameDebtorTwiceWhileOtherDebtorOutstanding() public {
        uint256 runId = _createRun(uint64(block.timestamp + 1 days));
        _proposeAndAccept(runId, alice, carol, 50 * USDG, keccak256("fund-alice"));
        _proposeAndAccept(runId, bob, carol, 30 * USDG, keccak256("fund-bob"));
        vm.prank(creator);
        clearing.closeRun(runId);
        _fund(alice, runId, 50 * USDG);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.AlreadyFunded.selector, runId, alice));
        clearing.fund(runId);
    }

    function test_RevertSettleBeforeCoverageAndTwice() public {
        uint256 runId = _closeFixture(uint64(block.timestamp + 1 days));
        vm.expectRevert(
            abi.encodeWithSelector(
                NetFoldClearing.InvalidRunState.selector,
                runId,
                NetFoldClearing.RunState.Covered,
                NetFoldClearing.RunState.Closed
            )
        );
        clearing.settleRun(runId);

        _fund(alice, runId, 60 * USDG);
        clearing.settleRun(runId);
        vm.expectRevert(
            abi.encodeWithSelector(
                NetFoldClearing.InvalidRunState.selector,
                runId,
                NetFoldClearing.RunState.Covered,
                NetFoldClearing.RunState.Settled
            )
        );
        clearing.settleRun(runId);
    }

    function test_RevertExpireBeforeDeadlineOrCoveredRun() public {
        uint64 deadline = uint64(block.timestamp + 1 days);
        uint256 runId = _closeFixture(deadline);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.FundingDeadlineNotReached.selector, runId, deadline));
        clearing.expireRun(runId);

        _fund(alice, runId, 60 * USDG);
        vm.warp(deadline);
        vm.expectRevert(
            abi.encodeWithSelector(
                NetFoldClearing.InvalidRunState.selector,
                runId,
                NetFoldClearing.RunState.Closed,
                NetFoldClearing.RunState.Covered
            )
        );
        clearing.expireRun(runId);
    }

    function test_RevertRefundUnlessExpiredFundedDebtorAndOnlyOnce() public {
        uint64 deadline = uint64(block.timestamp + 1 days);
        uint256 runId = _createRun(deadline);
        _proposeAndAccept(runId, alice, carol, 50 * USDG, keccak256("refund-alice"));
        _proposeAndAccept(runId, bob, carol, 30 * USDG, keccak256("refund-bob"));
        vm.prank(creator);
        clearing.closeRun(runId);
        _fund(alice, runId, 50 * USDG);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                NetFoldClearing.InvalidRunState.selector,
                runId,
                NetFoldClearing.RunState.Expired,
                NetFoldClearing.RunState.Closed
            )
        );
        clearing.claimRefund(runId);

        vm.warp(deadline);
        clearing.expireRun(runId);
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.NoRefundAvailable.selector, runId, bob));
        clearing.claimRefund(runId);

        vm.prank(alice);
        clearing.claimRefund(runId);
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                NetFoldClearing.InvalidRunState.selector,
                runId,
                NetFoldClearing.RunState.Expired,
                NetFoldClearing.RunState.Refunded
            )
        );
        clearing.claimRefund(runId);
    }

    function test_RevertUnknownRunObligationAndOutsiderViews() public {
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.RunNotFound.selector, 999));
        clearing.getRun(999);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.ObligationNotFound.selector, 999));
        clearing.getObligation(999);

        uint256 runId = _createRun(uint64(block.timestamp + 1 days));
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.NotParticipant.selector, runId, outsider));
        clearing.getPosition(runId, outsider);
        vm.expectRevert(abi.encodeWithSelector(NetFoldClearing.NotParticipant.selector, runId, outsider));
        clearing.requiredFunding(runId, outsider);
    }
}
