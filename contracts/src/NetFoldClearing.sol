// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title NetFoldClearing
/// @notice Bounded, covered multilateral obligation netting for one immutable ERC-20 token.
contract NetFoldClearing is ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_PARTICIPANTS = 8;
    uint256 public constant MAX_OBLIGATIONS = 32;
    uint256 public constant MAX_OBLIGATION_AMOUNT = type(uint128).max;
    uint256 public constant COMPRESSION_BPS_DENOMINATOR = 10_000;

    enum RunState {
        None,
        Open,
        Closed,
        Covered,
        Settled,
        Expired,
        Refunded,
        Cancelled
    }

    enum ObligationStatus {
        None,
        Pending,
        Accepted,
        Cancelled
    }

    struct Run {
        address creator;
        RunState state;
        uint64 fundingDeadline;
        uint64 createdAt;
        uint64 closedAt;
        uint64 settledAt;
        uint64 expiredAt;
        uint256 grossAmount;
        uint256 totalNetDebit;
        uint256 totalFunded;
        uint256 totalRefunded;
        address[] participants;
        uint256[] obligationIds;
    }

    struct Obligation {
        uint256 runId;
        address payer;
        address payee;
        uint256 amount;
        bytes32 referenceHash;
        ObligationStatus status;
        uint64 createdAt;
        uint64 acceptedAt;
    }

    struct Position {
        uint256 grossPayable;
        uint256 grossReceivable;
        uint256 netDebit;
        uint256 netCredit;
        uint256 funded;
        uint256 refunded;
    }

    error InvalidSettlementToken();
    error InvalidParticipantCount(uint256 count);
    error InvalidParticipant(address participant);
    error DuplicateParticipant(address participant);
    error InvalidDeadline(uint256 deadline);
    error RunNotFound(uint256 runId);
    error ObligationNotFound(uint256 obligationId);
    error NotRunCreator(uint256 runId, address caller);
    error InvalidRunState(uint256 runId, RunState expected, RunState actual);
    error FundingDeadlineReached(uint256 runId, uint256 deadline);
    error FundingDeadlineNotReached(uint256 runId, uint256 deadline);
    error TooManyObligations(uint256 runId);
    error NotParticipant(uint256 runId, address account);
    error InvalidObligationParties(address payer, address payee);
    error ZeroAmount();
    error AmountTooLarge(uint256 amount);
    error InvalidReferenceHash();
    error DuplicateReferenceHash(uint256 runId, bytes32 referenceHash);
    error InvalidObligationStatus(uint256 obligationId, ObligationStatus expected, ObligationStatus actual);
    error NotObligationPayer(uint256 obligationId, address caller);
    error NoObligations(uint256 runId);
    error UnacceptedObligation(uint256 obligationId);
    error AccountingMismatch(uint256 totalDebit, uint256 totalCredit);
    error NoFundingRequired(uint256 runId, address account);
    error AlreadyFunded(uint256 runId, address account);
    error UnsupportedTokenTransfer(uint256 expected, uint256 received);
    error RunNotFullyFunded(uint256 runId, uint256 funded, uint256 required);
    error NoRefundAvailable(uint256 runId, address account);

    event RunCreated(uint256 indexed runId, address indexed creator, uint64 fundingDeadline, address[] participants);
    event ObligationProposed(
        uint256 indexed runId,
        uint256 indexed obligationId,
        address indexed payer,
        address payee,
        uint256 amount,
        bytes32 referenceHash
    );
    event ObligationAccepted(uint256 indexed runId, uint256 indexed obligationId, address indexed payer);
    event ObligationCancelled(uint256 indexed runId, uint256 indexed obligationId);
    event RunClosed(uint256 indexed runId, uint256 grossAmount, uint256 totalNetDebit);
    event RunCovered(uint256 indexed runId, uint256 totalFunded);
    event RunFunded(uint256 indexed runId, address indexed debtor, uint256 amount);
    event SettlementPaid(uint256 indexed runId, address indexed creditor, uint256 amount);
    event RunSettled(uint256 indexed runId, uint256 totalSettled);
    event RunExpired(uint256 indexed runId, uint256 totalFunded);
    event DebtorRefunded(uint256 indexed runId, address indexed debtor, uint256 amount);
    event RunRefunded(uint256 indexed runId, uint256 totalRefunded);
    event RunCancelled(uint256 indexed runId);

    IERC20 public immutable settlementToken;
    uint256 public nextRunId = 1;
    uint256 public nextObligationId = 1;
    uint256 public totalEscrowed;

    mapping(uint256 runId => Run run) private _runs;
    mapping(uint256 obligationId => Obligation obligation) private _obligations;
    mapping(uint256 runId => mapping(address participant => bool included)) public isParticipant;
    mapping(uint256 runId => mapping(address participant => Position position)) private _positions;
    mapping(uint256 runId => mapping(bytes32 referenceHash => bool used)) public usedReferenceHash;

    constructor(IERC20 settlementToken_) {
        if (address(settlementToken_) == address(0) || address(settlementToken_).code.length == 0) {
            revert InvalidSettlementToken();
        }
        settlementToken = settlementToken_;
    }

    function createRun(address[] calldata participants, uint64 fundingDeadline) external returns (uint256 runId) {
        uint256 participantCount = participants.length;
        if (participantCount < 2 || participantCount > MAX_PARTICIPANTS) {
            revert InvalidParticipantCount(participantCount);
        }
        if (fundingDeadline <= block.timestamp) revert InvalidDeadline(fundingDeadline);

        runId = nextRunId++;
        Run storage run = _runs[runId];
        run.creator = msg.sender;
        run.state = RunState.Open;
        run.fundingDeadline = fundingDeadline;
        run.createdAt = uint64(block.timestamp);

        for (uint256 i; i < participantCount; ++i) {
            address participant = participants[i];
            if (participant == address(0)) revert InvalidParticipant(participant);
            if (isParticipant[runId][participant]) revert DuplicateParticipant(participant);
            isParticipant[runId][participant] = true;
            run.participants.push(participant);
        }

        emit RunCreated(runId, msg.sender, fundingDeadline, participants);
    }

    function proposeObligation(uint256 runId, address payer, address payee, uint256 amount, bytes32 referenceHash)
        external
        returns (uint256 obligationId)
    {
        Run storage run = _getRun(runId);
        _requireCreator(runId, run);
        _requireState(runId, run, RunState.Open);
        _requireBeforeDeadline(runId, run);

        if (run.obligationIds.length >= MAX_OBLIGATIONS) revert TooManyObligations(runId);
        if (!isParticipant[runId][payer]) revert NotParticipant(runId, payer);
        if (!isParticipant[runId][payee]) revert NotParticipant(runId, payee);
        if (payer == payee) revert InvalidObligationParties(payer, payee);
        if (amount == 0) revert ZeroAmount();
        if (amount > MAX_OBLIGATION_AMOUNT) revert AmountTooLarge(amount);
        if (referenceHash == bytes32(0)) revert InvalidReferenceHash();
        if (usedReferenceHash[runId][referenceHash]) {
            revert DuplicateReferenceHash(runId, referenceHash);
        }

        obligationId = nextObligationId++;
        _obligations[obligationId] = Obligation({
            runId: runId,
            payer: payer,
            payee: payee,
            amount: amount,
            referenceHash: referenceHash,
            status: ObligationStatus.Pending,
            createdAt: uint64(block.timestamp),
            acceptedAt: 0
        });
        usedReferenceHash[runId][referenceHash] = true;
        run.obligationIds.push(obligationId);

        emit ObligationProposed(runId, obligationId, payer, payee, amount, referenceHash);
    }

    function acceptObligation(uint256 runId, uint256 obligationId) external {
        Run storage run = _getRun(runId);
        _requireState(runId, run, RunState.Open);
        _requireBeforeDeadline(runId, run);

        Obligation storage obligation = _getObligation(obligationId);
        if (obligation.runId != runId) revert ObligationNotFound(obligationId);
        if (obligation.payer != msg.sender) revert NotObligationPayer(obligationId, msg.sender);
        _requireObligationStatus(obligationId, obligation, ObligationStatus.Pending);

        obligation.status = ObligationStatus.Accepted;
        obligation.acceptedAt = uint64(block.timestamp);
        emit ObligationAccepted(runId, obligationId, msg.sender);
    }

    function cancelObligation(uint256 runId, uint256 obligationId) external {
        Run storage run = _getRun(runId);
        _requireCreator(runId, run);
        _requireState(runId, run, RunState.Open);
        _requireBeforeDeadline(runId, run);

        Obligation storage obligation = _getObligation(obligationId);
        if (obligation.runId != runId) revert ObligationNotFound(obligationId);
        _requireObligationStatus(obligationId, obligation, ObligationStatus.Pending);

        obligation.status = ObligationStatus.Cancelled;
        emit ObligationCancelled(runId, obligationId);
    }

    function cancelRun(uint256 runId) external {
        Run storage run = _getRun(runId);
        _requireCreator(runId, run);
        _requireState(runId, run, RunState.Open);
        run.state = RunState.Cancelled;
        emit RunCancelled(runId);
    }

    function closeRun(uint256 runId) external {
        Run storage run = _getRun(runId);
        _requireCreator(runId, run);
        _requireState(runId, run, RunState.Open);
        _requireBeforeDeadline(runId, run);

        uint256 obligationCount = run.obligationIds.length;
        if (obligationCount == 0) revert NoObligations(runId);

        uint256 grossAmount;
        uint256 activeObligationCount;
        for (uint256 i; i < obligationCount; ++i) {
            uint256 obligationId = run.obligationIds[i];
            Obligation storage obligation = _obligations[obligationId];
            if (obligation.status == ObligationStatus.Cancelled) continue;
            if (obligation.status != ObligationStatus.Accepted) {
                revert UnacceptedObligation(obligationId);
            }
            ++activeObligationCount;
            grossAmount += obligation.amount;
            _positions[runId][obligation.payer].grossPayable += obligation.amount;
            _positions[runId][obligation.payee].grossReceivable += obligation.amount;
        }
        if (activeObligationCount == 0) revert NoObligations(runId);

        uint256 totalDebit;
        uint256 totalCredit;
        uint256 participantCount = run.participants.length;
        for (uint256 i; i < participantCount; ++i) {
            Position storage position = _positions[runId][run.participants[i]];
            if (position.grossPayable > position.grossReceivable) {
                position.netDebit = position.grossPayable - position.grossReceivable;
                totalDebit += position.netDebit;
            } else if (position.grossReceivable > position.grossPayable) {
                position.netCredit = position.grossReceivable - position.grossPayable;
                totalCredit += position.netCredit;
            }
        }
        if (totalDebit != totalCredit) revert AccountingMismatch(totalDebit, totalCredit);

        run.grossAmount = grossAmount;
        run.totalNetDebit = totalDebit;
        run.closedAt = uint64(block.timestamp);
        run.state = totalDebit == 0 ? RunState.Covered : RunState.Closed;

        emit RunClosed(runId, grossAmount, totalDebit);
        if (totalDebit == 0) emit RunCovered(runId, 0);
    }

    /// @notice Funds the caller's entire finalized net debit in one transfer.
    function fund(uint256 runId) external nonReentrant {
        Run storage run = _getRun(runId);
        _requireState(runId, run, RunState.Closed);
        _requireBeforeDeadline(runId, run);

        Position storage position = _positions[runId][msg.sender];
        uint256 amount = position.netDebit;
        if (amount == 0) revert NoFundingRequired(runId, msg.sender);
        if (position.funded != 0) revert AlreadyFunded(runId, msg.sender);

        position.funded = amount;
        run.totalFunded += amount;
        totalEscrowed += amount;

        uint256 balanceBefore = settlementToken.balanceOf(address(this));
        settlementToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = settlementToken.balanceOf(address(this)) - balanceBefore;
        if (received != amount) revert UnsupportedTokenTransfer(amount, received);

        emit RunFunded(runId, msg.sender, amount);
        if (run.totalFunded == run.totalNetDebit) {
            run.state = RunState.Covered;
            emit RunCovered(runId, run.totalFunded);
        }
    }

    function settleRun(uint256 runId) external nonReentrant {
        Run storage run = _getRun(runId);
        _requireState(runId, run, RunState.Covered);
        if (run.totalFunded != run.totalNetDebit) {
            revert RunNotFullyFunded(runId, run.totalFunded, run.totalNetDebit);
        }

        run.state = RunState.Settled;
        run.settledAt = uint64(block.timestamp);
        totalEscrowed -= run.totalNetDebit;

        uint256 participantCount = run.participants.length;
        for (uint256 i; i < participantCount; ++i) {
            address participant = run.participants[i];
            uint256 amount = _positions[runId][participant].netCredit;
            if (amount == 0) continue;
            settlementToken.safeTransfer(participant, amount);
            emit SettlementPaid(runId, participant, amount);
        }

        emit RunSettled(runId, run.totalNetDebit);
    }

    function expireRun(uint256 runId) external {
        Run storage run = _getRun(runId);
        _requireState(runId, run, RunState.Closed);
        if (block.timestamp < run.fundingDeadline) {
            revert FundingDeadlineNotReached(runId, run.fundingDeadline);
        }

        run.state = RunState.Expired;
        run.expiredAt = uint64(block.timestamp);
        emit RunExpired(runId, run.totalFunded);

        if (run.totalFunded == 0) {
            run.state = RunState.Refunded;
            emit RunRefunded(runId, 0);
        }
    }

    function claimRefund(uint256 runId) external nonReentrant {
        Run storage run = _getRun(runId);
        _requireState(runId, run, RunState.Expired);

        Position storage position = _positions[runId][msg.sender];
        uint256 amount = position.funded - position.refunded;
        if (amount == 0) revert NoRefundAvailable(runId, msg.sender);

        position.refunded += amount;
        run.totalRefunded += amount;
        totalEscrowed -= amount;

        if (run.totalRefunded == run.totalFunded) {
            run.state = RunState.Refunded;
            emit RunRefunded(runId, run.totalRefunded);
        }

        settlementToken.safeTransfer(msg.sender, amount);
        emit DebtorRefunded(runId, msg.sender, amount);
    }

    function getRun(uint256 runId) external view returns (Run memory) {
        Run storage run = _getRun(runId);
        return run;
    }

    function getParticipants(uint256 runId) external view returns (address[] memory) {
        return _getRun(runId).participants;
    }

    function getObligationIds(uint256 runId) external view returns (uint256[] memory) {
        return _getRun(runId).obligationIds;
    }

    function getObligation(uint256 obligationId) external view returns (Obligation memory) {
        return _getObligation(obligationId);
    }

    function getPosition(uint256 runId, address participant) external view returns (Position memory) {
        _getRun(runId);
        if (!isParticipant[runId][participant]) revert NotParticipant(runId, participant);
        return _positions[runId][participant];
    }

    function requiredFunding(uint256 runId, address participant) external view returns (uint256) {
        _getRun(runId);
        if (!isParticipant[runId][participant]) revert NotParticipant(runId, participant);
        Position storage position = _positions[runId][participant];
        return position.netDebit - position.funded;
    }

    function compressionBps(uint256 runId) external view returns (uint256) {
        Run storage run = _getRun(runId);
        if (run.grossAmount == 0) return 0;
        return ((run.grossAmount - run.totalNetDebit) * COMPRESSION_BPS_DENOMINATOR) / run.grossAmount;
    }

    function _getRun(uint256 runId) private view returns (Run storage run) {
        run = _runs[runId];
        if (run.state == RunState.None) revert RunNotFound(runId);
    }

    function _getObligation(uint256 obligationId) private view returns (Obligation storage obligation) {
        obligation = _obligations[obligationId];
        if (obligation.status == ObligationStatus.None) revert ObligationNotFound(obligationId);
    }

    function _requireCreator(uint256 runId, Run storage run) private view {
        if (run.creator != msg.sender) revert NotRunCreator(runId, msg.sender);
    }

    function _requireState(uint256 runId, Run storage run, RunState expected) private view {
        if (run.state != expected) revert InvalidRunState(runId, expected, run.state);
    }

    function _requireBeforeDeadline(uint256 runId, Run storage run) private view {
        if (block.timestamp >= run.fundingDeadline) {
            revert FundingDeadlineReached(runId, run.fundingDeadline);
        }
    }

    function _requireObligationStatus(uint256 obligationId, Obligation storage obligation, ObligationStatus expected)
        private
        view
    {
        if (obligation.status != expected) {
            revert InvalidObligationStatus(obligationId, expected, obligation.status);
        }
    }
}
