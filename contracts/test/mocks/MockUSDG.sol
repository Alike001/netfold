// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDG is ERC20 {
    error BlockedRecipient(address recipient);

    address public blockedRecipient;

    constructor() ERC20("Mock USDG", "mUSDG") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }

    function setBlockedRecipient(address recipient) external {
        blockedRecipient = recipient;
    }

    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0) && to == blockedRecipient) revert BlockedRecipient(to);
        super._update(from, to, value);
    }
}
