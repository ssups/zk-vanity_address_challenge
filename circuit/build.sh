# !/bin/bash

set -e

rm -rf ./target/vanity_address_challenge.json
rm -rf ./target/vk

echo "Compiling circuit..."
if ! nargo compile; then
    echo "Compilation failed. Exiting..."
    exit 1
fi

cp ./target/vanity_address_challenge.json ../client/src/zk/circuit.json

echo "Generating vkey..."
bb write_vk -b ./target/vanity_address_challenge.json -o ./target --oracle_hash keccak


echo "Generating solidity verifier..."
bb write_solidity_verifier -k ./target/vk -o ../contract/src/Verifier.sol

echo "Done"