// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {NetFoldClearing} from "../src/NetFoldClearing.sol";
import {NetFoldFixture} from "./helpers/NetFoldFixture.sol";

contract NetFoldClearingFuzzTest is NetFoldFixture {
    struct GraphModel {
        uint256 runId;
        uint256 expectedGross;
        address[] participants;
        uint256[] grossPayable;
        uint256[] grossReceivable;
    }

    function testFuzz_BoundedGraphNettingMatchesIndependentModel(
        uint8 participantSeed,
        uint8 obligationSeed,
        uint256 seed
    ) public {
        uint256 participantCount = bound(uint256(participantSeed), 2, 8);
        uint256 obligationCount = bound(uint256(obligationSeed), 1, 32);
        GraphModel memory model = _createRandomGraph(participantCount, obligationCount, seed);

        vm.prank(creator);
        clearing.closeRun(model.runId);

        uint256 expectedDebit;
        uint256 expectedCredit;
        for (uint256 i; i < participantCount; ++i) {
            NetFoldClearing.Position memory position = clearing.getPosition(model.runId, model.participants[i]);
            uint256 netDebit =
                model.grossPayable[i] > model.grossReceivable[i] ? model.grossPayable[i] - model.grossReceivable[i] : 0;
            uint256 netCredit =
                model.grossReceivable[i] > model.grossPayable[i] ? model.grossReceivable[i] - model.grossPayable[i] : 0;

            assertEq(position.grossPayable, model.grossPayable[i]);
            assertEq(position.grossReceivable, model.grossReceivable[i]);
            assertEq(position.netDebit, netDebit);
            assertEq(position.netCredit, netCredit);
            expectedDebit += netDebit;
            expectedCredit += netCredit;
        }

        NetFoldClearing.Run memory run = clearing.getRun(model.runId);
        assertEq(run.grossAmount, model.expectedGross);
        assertEq(run.totalNetDebit, expectedDebit);
        assertEq(expectedDebit, expectedCredit);
        assertLe(expectedDebit, model.expectedGross);
        assertLe(clearing.compressionBps(model.runId), 10_000);
    }

    function testFuzz_ExactFundingAndAtomicSettlement(
        uint96 rawAliceToBob,
        uint96 rawBobToCarol,
        uint96 rawCarolToAlice
    ) public {
        uint256 aliceToBob = bound(uint256(rawAliceToBob), 1, 1_000_000 * USDG);
        uint256 bobToCarol = bound(uint256(rawBobToCarol), 1, 1_000_000 * USDG);
        uint256 carolToAlice = bound(uint256(rawCarolToAlice), 1, 1_000_000 * USDG);
        uint256 runId = _createRun(uint64(block.timestamp + 1 days));
        _proposeAndAccept(runId, alice, bob, aliceToBob, keccak256("fuzz-a-b"));
        _proposeAndAccept(runId, bob, carol, bobToCarol, keccak256("fuzz-b-c"));
        _proposeAndAccept(runId, carol, alice, carolToAlice, keccak256("fuzz-c-a"));
        vm.prank(creator);
        clearing.closeRun(runId);

        address[] memory participants = _participants();
        uint256 totalDebit;
        uint256 totalCredit;
        uint256[3] memory credits;
        for (uint256 i; i < participants.length; ++i) {
            NetFoldClearing.Position memory position = clearing.getPosition(runId, participants[i]);
            totalDebit += position.netDebit;
            totalCredit += position.netCredit;
            credits[i] = position.netCredit;
            if (position.netDebit != 0) {
                _fund(participants[i], runId, position.netDebit);
                assertEq(clearing.requiredFunding(runId, participants[i]), 0);
            }
        }

        assertEq(totalDebit, totalCredit);
        assertEq(clearing.getRun(runId).totalFunded, totalDebit);
        assertEq(uint256(clearing.getRun(runId).state), uint256(NetFoldClearing.RunState.Covered));

        clearing.settleRun(runId);
        for (uint256 i; i < participants.length; ++i) {
            assertEq(token.balanceOf(participants[i]), credits[i]);
        }
        assertEq(token.balanceOf(address(clearing)), 0);
        assertEq(clearing.totalEscrowed(), 0);
    }

    function testFuzz_ExpiredRunRefundsEveryFundedDebtorExactly(
        uint96 rawAliceDebit,
        uint96 rawBobDebit,
        uint96 rawCarolDebit,
        uint8 fundingMask
    ) public {
        uint256 aliceDebit = bound(uint256(rawAliceDebit), 1, 1_000_000 * USDG);
        uint256 bobDebit = bound(uint256(rawBobDebit), 1, 1_000_000 * USDG);
        uint256 carolDebit = bound(uint256(rawCarolDebit), 1, 1_000_000 * USDG);
        fundingMask = uint8(bound(uint256(fundingMask), 0, 6));

        address fourth = makeAddr("fourth-creditor");
        address[] memory participants = new address[](4);
        participants[0] = alice;
        participants[1] = bob;
        participants[2] = carol;
        participants[3] = fourth;
        uint64 deadline = uint64(block.timestamp + 1 days);

        vm.prank(creator);
        uint256 runId = clearing.createRun(participants, deadline);
        _proposeAndAccept(runId, alice, fourth, aliceDebit, keccak256("refund-fuzz-a"));
        _proposeAndAccept(runId, bob, fourth, bobDebit, keccak256("refund-fuzz-b"));
        _proposeAndAccept(runId, carol, fourth, carolDebit, keccak256("refund-fuzz-c"));
        vm.prank(creator);
        clearing.closeRun(runId);

        uint256 expectedFunded;
        uint256[3] memory debits = [aliceDebit, bobDebit, carolDebit];
        address[3] memory debtors = [alice, bob, carol];
        for (uint256 i; i < debtors.length; ++i) {
            if ((fundingMask & (1 << i)) == 0) continue;
            _fund(debtors[i], runId, debits[i]);
            expectedFunded += debits[i];
        }

        vm.warp(deadline);
        clearing.expireRun(runId);
        if (expectedFunded == 0) {
            assertEq(uint256(clearing.getRun(runId).state), uint256(NetFoldClearing.RunState.Refunded));
        } else {
            for (uint256 i; i < debtors.length; ++i) {
                if ((fundingMask & (1 << i)) == 0) continue;
                vm.prank(debtors[i]);
                clearing.claimRefund(runId);
                assertEq(token.balanceOf(debtors[i]), debits[i]);
            }
        }

        NetFoldClearing.Run memory run = clearing.getRun(runId);
        assertEq(run.totalFunded, expectedFunded);
        assertEq(run.totalRefunded, expectedFunded);
        assertEq(uint256(run.state), uint256(NetFoldClearing.RunState.Refunded));
        assertEq(token.balanceOf(address(clearing)), 0);
        assertEq(clearing.totalEscrowed(), 0);
    }

    function _createRandomGraph(uint256 participantCount, uint256 obligationCount, uint256 seed)
        private
        returns (GraphModel memory model)
    {
        model.participants = new address[](participantCount);
        model.grossPayable = new uint256[](participantCount);
        model.grossReceivable = new uint256[](participantCount);
        for (uint256 i; i < participantCount; ++i) {
            model.participants[i] = address(uint160(0x1000 + i));
        }

        vm.prank(creator);
        model.runId = clearing.createRun(model.participants, uint64(block.timestamp + 7 days));

        for (uint256 i; i < obligationCount; ++i) {
            uint256 entropy = uint256(keccak256(abi.encode(seed, i)));
            uint256 payerIndex = entropy % participantCount;
            uint256 payeeIndex = (payerIndex + 1 + ((entropy >> 32) % (participantCount - 1))) % participantCount;
            uint256 amount = bound(entropy >> 64, 1, 1_000_000 * USDG);
            _recordRandomObligation(
                model.runId,
                model.participants[payerIndex],
                model.participants[payeeIndex],
                amount,
                keccak256(abi.encode("fuzz-reference", seed, i))
            );
            model.grossPayable[payerIndex] += amount;
            model.grossReceivable[payeeIndex] += amount;
            model.expectedGross += amount;
        }
    }

    function _recordRandomObligation(uint256 runId, address payer, address payee, uint256 amount, bytes32 referenceHash)
        private
    {
        vm.prank(creator);
        uint256 obligationId = clearing.proposeObligation(runId, payer, payee, amount, referenceHash);
        vm.prank(payer);
        clearing.acceptObligation(runId, obligationId);
    }
}
