// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Script, console2} from "forge-std/Script.sol";

contract Preflight is Script {
    uint256 internal constant ARBITRUM_SEPOLIA_CHAIN_ID = 421_614;
    address internal constant CANONICAL_USDG = 0xFFC95faa3d63Cde504a05B567C600B78C0b41892;
    uint256 internal constant REQUIRED_ALICE_USDG = 60e6;

    function run() external view {
        uint256 minimumGasBalance = vm.envOr("MIN_GAS_BALANCE_WEI", uint256(0.001 ether));
        IERC20Metadata token = IERC20Metadata(CANONICAL_USDG);
        bool ready = true;

        console2.log("NETFOLD ARBITRUM SEPOLIA PREFLIGHT");
        console2.log("chain id", block.chainid);
        console2.log("canonical USDG", CANONICAL_USDG);

        bool networkPass = block.chainid == ARBITRUM_SEPOLIA_CHAIN_ID;
        _row("NETWORK", networkPass ? "PASS" : "BLOCKED");
        ready = ready && networkPass;

        bool codePass = CANONICAL_USDG.code.length != 0;
        _row("USDG CODE", codePass ? "PASS" : "BLOCKED");
        ready = ready && codePass;

        bool symbolPass;
        if (codePass) {
            try token.symbol() returns (string memory symbol) {
                console2.log("USDG symbol", symbol);
                symbolPass = keccak256(bytes(symbol)) == keccak256("USDG");
            } catch {
                symbolPass = false;
            }
        }
        _row("USDG SYMBOL", symbolPass ? "PASS" : "BLOCKED");
        ready = ready && symbolPass;

        bool decimalsPass;
        if (codePass) {
            try token.decimals() returns (uint8 decimals) {
                console2.log("USDG decimals", uint256(decimals));
                decimalsPass = decimals == 6;
            } catch {
                decimalsPass = false;
            }
        }
        _row("USDG DECIMALS", decimalsPass ? "PASS" : "BLOCKED");
        ready = ready && decimalsPass;

        bool deployerReady =
            _walletReport("DEPLOYER", vm.envOr("DEPLOYER_PRIVATE_KEY", uint256(0)), token, minimumGasBalance, 0);
        bool aliceReady = _walletReport(
            "ALICE", vm.envOr("ALICE_PRIVATE_KEY", uint256(0)), token, minimumGasBalance, REQUIRED_ALICE_USDG
        );
        bool bobReady = _walletReport("BOB", vm.envOr("BOB_PRIVATE_KEY", uint256(0)), token, minimumGasBalance, 0);
        bool carolReady = _walletReport("CAROL", vm.envOr("CAROL_PRIVATE_KEY", uint256(0)), token, minimumGasBalance, 0);
        ready = ready && deployerReady && aliceReady && bobReady && carolReady;

        console2.log("minimum wallet gas wei", minimumGasBalance);
        console2.log("required Alice USDG units", REQUIRED_ALICE_USDG);
        _row("OVERALL READINESS", ready ? "PASS" : "BLOCKED");
    }

    function _walletReport(
        string memory label,
        uint256 privateKey,
        IERC20Metadata token,
        uint256 minimumGasBalance,
        uint256 minimumTokenBalance
    ) private view returns (bool ready) {
        if (privateKey == 0) {
            _row(string.concat(label, " CONFIG"), "BLOCKED");
            return false;
        }

        address account = vm.addr(privateKey);
        uint256 gasBalance = account.balance;
        console2.log(string.concat(label, " address"), account);
        console2.log(string.concat(label, " ETH wei"), gasBalance);
        bool gasReady = gasBalance >= minimumGasBalance;
        _row(string.concat(label, " GAS"), gasReady ? "PASS" : "BLOCKED");

        bool tokenReadable;
        bool tokenReady;
        try token.balanceOf(account) returns (uint256 tokenBalance) {
            tokenReadable = true;
            tokenReady = tokenBalance >= minimumTokenBalance;
            console2.log(string.concat(label, " USDG units"), tokenBalance);
        } catch {
            tokenReadable = false;
            tokenReady = false;
        }
        _row(string.concat(label, " USDG READ"), tokenReadable ? "PASS" : "BLOCKED");
        if (minimumTokenBalance != 0) {
            _row(string.concat(label, " USDG FUNDING"), tokenReady ? "PASS" : "BLOCKED");
        }
        return gasReady && tokenReadable && tokenReady;
    }

    function _row(string memory label, string memory status) private pure {
        console2.log(string.concat(label, "             ", status));
    }
}
