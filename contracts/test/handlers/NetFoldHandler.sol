// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {NetFoldClearing} from "../../src/NetFoldClearing.sol";
import {MockUSDG} from "../mocks/MockUSDG.sol";

contract NetFoldHandler is Test {
    NetFoldClearing public immutable clearing;
    MockUSDG public immutable token;

    uint256 public immutable settlementRunId;
    uint256 public immutable refundRunId;
    uint64 public immutable refundDeadline;

    address public immutable settlementDebtor;
    address public immutable refundDebtorOne;
    address public immutable refundDebtorTwo;

    uint256 public ghostFunded;
    uint256 public ghostPaid;
    uint256 public ghostRefunded;
    uint256 public ghostSettlementCalls;
    uint256 public ghostRefundCompletionCalls;

    constructor(
        NetFoldClearing clearing_,
        MockUSDG token_,
        uint256 settlementRunId_,
        uint256 refundRunId_,
        uint64 refundDeadline_,
        address settlementDebtor_,
        address refundDebtorOne_,
        address refundDebtorTwo_
    ) {
        clearing = clearing_;
        token = token_;
        settlementRunId = settlementRunId_;
        refundRunId = refundRunId_;
        refundDeadline = refundDeadline_;
        settlementDebtor = settlementDebtor_;
        refundDebtorOne = refundDebtorOne_;
        refundDebtorTwo = refundDebtorTwo_;
    }

    function fundSettlementRun() external {
        if (clearing.getRun(settlementRunId).state != NetFoldClearing.RunState.Closed) return;
        uint256 amount = clearing.requiredFunding(settlementRunId, settlementDebtor);
        if (amount == 0 || block.timestamp >= clearing.getRun(settlementRunId).fundingDeadline) {
            return;
        }
        vm.prank(settlementDebtor);
        clearing.fund(settlementRunId);
        ghostFunded += amount;
    }

    function settleSettlementRun() external {
        NetFoldClearing.Run memory run = clearing.getRun(settlementRunId);
        if (run.state != NetFoldClearing.RunState.Covered) return;
        clearing.settleRun(settlementRunId);
        ghostPaid += run.totalNetDebit;
        ++ghostSettlementCalls;
    }

    function fundFirstRefundDebtor() external {
        _fundRefundDebtor(refundDebtorOne);
    }

    function fundSecondRefundDebtor() external {
        _fundRefundDebtor(refundDebtorTwo);
    }

    function warpToRefundDeadline() external {
        if (block.timestamp < refundDeadline) vm.warp(refundDeadline);
    }

    function expireRefundRun() external {
        NetFoldClearing.Run memory run = clearing.getRun(refundRunId);
        if (run.state != NetFoldClearing.RunState.Closed || block.timestamp < refundDeadline) {
            return;
        }
        clearing.expireRun(refundRunId);
        if (run.totalFunded == 0) ++ghostRefundCompletionCalls;
    }

    function claimFirstRefund() external {
        _claimRefund(refundDebtorOne);
    }

    function claimSecondRefund() external {
        _claimRefund(refundDebtorTwo);
    }

    function _fundRefundDebtor(address debtor) private {
        NetFoldClearing.Run memory run = clearing.getRun(refundRunId);
        if (run.state != NetFoldClearing.RunState.Closed || block.timestamp >= refundDeadline) {
            return;
        }
        uint256 amount = clearing.requiredFunding(refundRunId, debtor);
        if (amount == 0) return;
        vm.prank(debtor);
        clearing.fund(refundRunId);
        ghostFunded += amount;
    }

    function _claimRefund(address debtor) private {
        if (clearing.getRun(refundRunId).state != NetFoldClearing.RunState.Expired) return;
        NetFoldClearing.Position memory position = clearing.getPosition(refundRunId, debtor);
        uint256 amount = position.funded - position.refunded;
        if (amount == 0) return;
        vm.prank(debtor);
        clearing.claimRefund(refundRunId);
        ghostRefunded += amount;
        if (clearing.getRun(refundRunId).state == NetFoldClearing.RunState.Refunded) {
            ++ghostRefundCompletionCalls;
        }
    }
}
