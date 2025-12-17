// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Token} from "../src/Token.sol";

contract DeployTokens is Script {
    Token[] public tokens;

    function run() public {
        vm.startBroadcast();

        // Supply: 10000000000 tokens with 18 decimals
        uint256 initialSupply = 10_000_000_000 * 10**18;

        // Deploy 10 tokens with different names
        string[10] memory tokenNames = [
            "Token A",
            "Token B",
            "Token C",
            "Token D",
            "Token E",
            "Token F",
            "Token G",
            "Token H",
            "Token I",
            "Token J"
        ];

        string[10] memory tokenSymbols = [
            "TKA",
            "TKB",
            "TKC",
            "TKD",
            "TKE",
            "TKF",
            "TKG",
            "TKH",
            "TKI",
            "TKJ"
        ];

        for (uint i = 0; i < 2; i++) {
            Token token = new Token(tokenNames[i], tokenSymbols[i], initialSupply);
            console.log("%s deployed at:", tokenNames[i], address(token));
        }

        vm.stopBroadcast();
    }
}
