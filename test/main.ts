import dontenv from "dotenv";
import { ethers } from "ethers";
import { generateProof } from "./pkg/generateProof";
import fs from "fs";

async function main() {
  dontenv.config();

  const pk = process.env.ONE_LEADING_ZERO_PK;
  if (!pk) {
    throw new Error("FOUR_LEADING_ZERO_PK is not set in .env file");
  }

  const message = "I found a vanity address";
  const hashedMessage = ethers.hashMessage(message);

  const wallet = new ethers.Wallet(pk);
  const sig = await wallet.signMessage(message);
  const sigWithoutV = sig.slice(0, 130); // remove 'v'

  const uncompressedPubKey = ethers.SigningKey.recoverPublicKey(
    hashedMessage,
    sig
  );
  const pubKey = uncompressedPubKey.slice(4); // remove '0x04' uncompressed flag prefix
  const pubKeyX = "0x" + pubKey.substring(0, 64);
  const pubKeyY = "0x" + pubKey.substring(64);

  const { proof, publicInputs, witness } = await generateProof({
    pub_key_x: [...ethers.getBytes(pubKeyX)],
    pub_key_y: [...ethers.getBytes(pubKeyY)],
    signature: [...ethers.getBytes(sigWithoutV)],
    hashed_message: [...ethers.getBytes(hashedMessage)],
    leading_zeros: 1,
  });

  // console.log({ proof, publicInputs });

  console.log(ethers.hexlify(proof));
  // console.log("Public Inputs:", publicInputs);

  fs.writeFileSync("../circuit/target/proof", proof);
  console.log(proof.length);

  // not really needed as we harcode the public input in the contract test
  fs.writeFileSync(
    "../circuit/target/public-inputs",
    JSON.stringify(publicInputs)
  );

  fs.writeFileSync("../circuit/target/witness.gz", witness);

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
