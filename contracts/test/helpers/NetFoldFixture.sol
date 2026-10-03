// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {NetFoldClearing} from "../../src/NetFoldClearing.sol";
import {MockUSDG} from "../mocks/MockUSDG.sol";

abstract contract NetFoldFixture is Test {
    uint256 internal constant USDG = 1e6;
    uint256 internal constant ALICE_TO_BOB = 100 * USDG;
    uint256 internal constant BOB_TO_CAROL = 60 * USDG;
    uint256 internal constant CAROL_TO_ALICE = 40 * USDG;

    address internal creator;
    address internal alice;
    address internal bob;
    address internal carol;
    address internal outsider;

    MockUSDG internal token;
    NetFoldClearing internal clearing;

    function setUp() public virtual {
        creator = makeAddr("creator");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        carol = makeAddr("carol");
        outsider = makeAddr("outsider");

        token = new MockUSDG();
        clearing = new NetFoldClearing(token);
    }

    function _participants() internal view returns (address[] memory participants) {
        participants = new address[](3);
        participants[0] = alice;
        participants[1] = bob;
        participants[2] = carol;
    }

    function _createRun(uint64 deadline) internal returns (uint256 runId) {
        vm.prank(creator);
        runId = clearing.createRun(_participants(), deadline);
    }

    function _proposeAndAccept(uint256 runId, address payer, address payee, uint256 amount, bytes32 referenceHash)
        internal
        returns (uint256 obligationId)
    {
        vm.prank(creator);
        obligationId = clearing.proposeObligation(runId, payer, payee, amount, referenceHash);
        vm.prank(payer);
        clearing.acceptObligation(runId, obligationId);
    }

    function _createAcceptedFixture(uint64 deadline) internal returns (uint256 runId) {
        runId = _createRun(deadline);
        _proposeAndAccept(runId, alice, bob, ALICE_TO_BOB, keccak256("invoice-100"));
        _proposeAndAccept(runId, bob, carol, BOB_TO_CAROL, keccak256("invoice-60"));
        _proposeAndAccept(runId, carol, alice, CAROL_TO_ALICE, keccak256("invoice-40"));
    }

    function _closeFixture(uint64 deadline) internal returns (uint256 runId) {
        runId = _createAcceptedFixture(deadline);
        vm.prank(creator);
        clearing.closeRun(runId);
    }

    function _fund(address debtor, uint256 runId, uint256 amount) internal {
        token.mint(debtor, amount);
        vm.prank(debtor);
        token.approve(address(clearing), amount);
        vm.prank(debtor);
        clearing.fund(runId);
    }
}
