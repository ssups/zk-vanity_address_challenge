// SPDX-License-Identifier: MIT

pragma solidity ^0.8.27;

import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {EnumerableSet} from "openzeppelin-contracts/contracts/utils/structs/EnumerableSet.sol";
import {Address} from "openzeppelin-contracts/contracts/utils/Address.sol";
import {IVerifier} from "src/Verifier.sol";

struct ChallengeInfo {
    uint256 leadingZeros;
    uint256 rewards;
    uint256 remainRewarders;
}

contract VanityAddressChallenge is Ownable {
    using EnumerableSet for EnumerableSet.UintSet;
    using Address for address payable;

    event NewChallengeAdded(uint256 indexed challengeId);
    event ChallengeSolved(uint256 indexed challengeId, uint256 remainRewarders);
    event ChallengeCompleted(uint256 indexed challengeId);
    event AllChallengesStopped();

    IVerifier public verifier;
    EnumerableSet.UintSet private activeChallengeIds;
    uint256 private nextChallengeId;
    mapping(uint256 challengeId => ChallengeInfo) public challengeInfo;
    mapping(bytes32 nulifier => bool) public usedNulifiers;

    constructor(address owner_, address verifier_) Ownable(owner_) {
        verifier = IVerifier(verifier_);
    }

    function addChallenge(uint256 leadingZeros, uint256 rewards, uint256 remainRewarders) external payable onlyOwner {
        require(leadingZeros > 0 && rewards > 0 && remainRewarders > 0, "All parameters must be greater than zero");
        require(msg.value == rewards * remainRewarders, "Incorrect Ether sent for rewards");

        uint256 newChallengeId = nextChallengeId++;
        activeChallengeIds.add(newChallengeId);
        challengeInfo[newChallengeId] =
            ChallengeInfo({leadingZeros: leadingZeros, rewards: rewards, remainRewarders: remainRewarders});

        emit NewChallengeAdded(newChallengeId);
    }

    function challenge(uint256 challengeId, bytes32 nulifier, bytes calldata proof) external {
        require(activeChallengeIds.contains(challengeId), "Challenge not active");
        require(!usedNulifiers[nulifier], "Nulifier already used");
        ChallengeInfo storage info = challengeInfo[challengeId];

        bytes32[] memory publicInputs = new bytes32[](3);
        publicInputs[0] = bytes32(info.leadingZeros);
        publicInputs[1] = nulifier >> 128;
        publicInputs[2] = nulifier & bytes32(uint256(type(uint128).max));

        bool verified = verifier.verify(proof, publicInputs);
        require(verified, "Invalid proof");

        payable(msg.sender).sendValue(info.rewards);
        uint256 remainRewarders = --info.remainRewarders;
        usedNulifiers[nulifier] = true;

        emit ChallengeSolved(challengeId, remainRewarders);

        if (remainRewarders == 0) {
            activeChallengeIds.remove(challengeId);
            emit ChallengeCompleted(challengeId);
        }
    }

    function stopAllChallenges() external onlyOwner {
        uint256[] memory challengeIds = activeChallengeIds.values();
        uint256 length = challengeIds.length;
        for (uint256 i = 0; i < length; i++) {
            uint256 challengeId = challengeIds[i];
            ChallengeInfo storage info = challengeInfo[challengeId];
            uint256 remainRewarders = info.remainRewarders;
            if (info.remainRewarders > 0) {
                payable(owner()).sendValue(info.rewards * remainRewarders);
            }
            info.remainRewarders = 0;
        }

        emit AllChallengesStopped();
    }

    function getActiveChallengeIds() external view returns (uint256[] memory) {
        return activeChallengeIds.values();
    }

    function getActiveChallengeId(uint256 index) external view returns (uint256) {
        return activeChallengeIds.at(index);
    }

    function getActiveChallengeLength() external view returns (uint256) {
        return activeChallengeIds.length();
    }
}
