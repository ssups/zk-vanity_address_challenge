import dontenv from "dotenv";
import { ethers } from "ethers";
import { generateProof } from "./pkg/generateProof";
import { blake2s256 } from "@noir-lang/noir_js";
import fs from "fs";

async function main() {
  dontenv.config();

  const pk = process.env.FOUR_LEADING_ZERO_PK;
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

  const nulifier = ethers.hexlify(blake2s256(ethers.getBytes(wallet.address)));
  const splitedNulifier = [nulifier.slice(0, 34), "0x" + nulifier.slice(34)];

  const { proof, publicInputs, witness, verify } = await generateProof({
    pub_key_x: [...ethers.getBytes(pubKeyX)],
    pub_key_y: [...ethers.getBytes(pubKeyY)],
    signature: [...ethers.getBytes(sigWithoutV)],
    hashed_message: [...ethers.getBytes(hashedMessage)],
    leading_zeros: 4,
    nulifier: splitedNulifier,
  });

  console.log(ethers.hexlify(proof));
  console.log("Verify: ", await verify);

  fs.writeFileSync("../circuit/target/proof", proof);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
