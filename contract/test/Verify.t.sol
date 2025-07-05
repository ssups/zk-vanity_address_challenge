// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {Test} from "forge-std/Test.sol";
import {HonkVerifier} from "src/Verifier.sol";

contract VerifyTest is Test {
    HonkVerifier public verifier;
    bytes32[] public publicInputs = new bytes32[](3);

    function setUp() public {
        verifier = new HonkVerifier();
        publicInputs[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000004);
        publicInputs[1] = bytes32(0x00000000000000000000000000000000538f8f1d4a9652b5623db4fde17c7fb5);
        publicInputs[2] = bytes32(0x000000000000000000000000000000005dd7ea0780714db31448ae6fd71296fd);
    }

    function testVerifyProof() public view {
        bytes memory proof = vm.readFileBinary("../circuit/target/proof");

        verifier.verify(proof, publicInputs);
    }
}
