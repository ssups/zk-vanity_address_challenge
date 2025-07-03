import { UltraHonkBackend, Barretenberg } from "@aztec/bb.js";
import circuit from "../../circuit/target/vanity_address_challenge.json";
import { InputMap, Noir, ErrorWithPayload } from "@noir-lang/noir_js";

export async function generateProof(inputs: InputMap) {
  const bbb = Barretenberg.new({});
  const noir = new Noir(circuit as any);
  const honk = new UltraHonkBackend(circuit.bytecode, { threads: 1 });
  let witness = new Uint8Array();
  try {
    const circuitRet = await noir.execute(inputs);
    witness = circuitRet.witness;
  } catch (error: any) {
    throw new Error((error as ErrorWithPayload).message);
  }

  const proofData = await honk.generateProof(witness, {
    keccak: true,
  });
  console.log("verify: ", await honk.verifyProof(proofData, { keccak: true }));
  return { ...proofData, witness };
}
