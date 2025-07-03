# !/bin/bash

set -e

rm -rf ./target/*

echo "Compiling circuit..."
if ! nargo compile; then
    echo "Compilation failed. Exiting..."
    exit 1
fi

# nargo execute witness.gz &&
# echo "Witness generated successfully." &&
# bb prove --scheme ultra_honk --oracle_hash keccak -b ./target/vanity_address_challenge.json -w ./target/witness.gz -o ./target &&
# echo "Proof generated successfully." &&

echo "Generating vkey..."

bb write_vk -b ./target/vanity_address_challenge.json -o ./target --oracle_hash keccak
# bb write_vk --scheme ultra_honk -b ./target/vanity_address_challenge.json -o ./target
# bb write_vk --scheme ultra_honk --oracle_hash keccak -b ./target/vanity_address_challenge.json -o ./target

# bb verify --scheme ultra_honk --oracle_hash keccak -k ./target/vk -p ./target/proof


echo "Generating solidity verifier..."

bb write_solidity_verifier -k ./target/vk -o ../contract/src/Verifier.sol
# bb write_solidity_verifier --scheme ultra_honk -k ./target/vk -o ../contract/src/Verifier.sol

echo "Done"