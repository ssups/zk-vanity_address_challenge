# !/bin/bash

forge build
mkdir -p ../client/src/contracts
cp out/VanityAddressChallenge.sol/VanityAddressChallenge.json ../client/src/contracts/VanityAddressChallenge.json
cp out/Verifier.sol/HonkVerifier.json ../client/src/contracts/HonkVerifier.json