import { ethers } from "ethers";
import React from "react";
import { contracts } from "../config/contracts";
const useContract = (provider: ethers.BrowserProvider | null) => {
  const [challengeC, setChallengeC] = React.useState<ethers.Contract | null>(
    null
  );
  const [verifierC, setVerifierC] = React.useState<ethers.Contract | null>(
    null
  );

  React.useEffect(() => {
    if (!provider) return;

    const challengeContract = new ethers.Contract(
      contracts.challenge.address,
      contracts.challenge.abi,
      provider
    );
    setChallengeC(challengeContract);

    const verifierContract = new ethers.Contract(
      contracts.verifier.address,
      contracts.verifier.abi,
      provider
    );
    setVerifierC(verifierContract);
  }, [provider]);

  return { challengeC, verifierC };
};

export default useContract;
