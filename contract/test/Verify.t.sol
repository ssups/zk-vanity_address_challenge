// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {HonkVerifier} from "src/Verifier.sol";

contract VerifyTest is Test {
    HonkVerifier public verifier;
    bytes32[] public publicInputs = new bytes32[](1);
    // bytes32[] public publicInputs = new bytes32[](0);

    function setUp() public {
        verifier = new HonkVerifier();

        publicInputs[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000003);
    }

    function testVerifyProof() public {
        bytes memory proof = vm.readFileBinary(
            "../circuit/target/proof"
        );

        console.log("Proof length:", proof.length);
        verifier.verify(proof, publicInputs);
    }
}