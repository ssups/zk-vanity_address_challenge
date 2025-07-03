# !/bin/bash

nargo execute witness.gz &&
echo "Witness generated successfully." &&
bb prove --scheme ultra_honk --oracle_hash keccak -b ./target/vanity_address_challenge.json -w ./target/witness.gz -o ./target &&
echo "Proof generated successfully." &&
bb write_vk --scheme ultra_honk --oracle_hash keccak -b ./target/vanity_address_challenge.json -o ./target &&
echo "Verification key generated successfully." &&
bb verify --scheme ultra_honk --oracle_hash keccak -k ./target/vk -p ./target/proof