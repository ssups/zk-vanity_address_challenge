import React, { useState, useEffect } from "react";
import useMetaMask from "./hooks/useMetaMask";
import { ethers } from "ethers";
import { styles } from "./styles/styles";
import { getNetworkName, getExplorerUrl } from "./config/networks";
import useContract from "./hooks/useContract";
import { generateProof } from "./zk/generateProof";
import { blake2s256, Noir } from "@noir-lang/noir_js";

interface Challenge {
  id: number;
  rewards: number;
  remainRewarders: number;
  leadingZeros: number;
}

function App() {
  const { account, balance, chainId, provider, connect } = useMetaMask();
  const { challengeC, verifierC } = useContract(provider);

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const [proof, setProof] = useState<string | null>(null);
  const [nulifier, setNulifier] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.substring(0, 10)}...${address.substring(
      address.length - 4
    )}`;
  };

  useEffect(() => {
    if (!challengeC) return;

    (async () => {
      const ids: bigint[] = await challengeC.getActiveChallengeIds();
      const promises = ids.map(async (id) => {
        const info = await challengeC.challengeInfo(id);
        return {
          id: Number(id),
          rewards: Number(info.rewards),
          remainRewarders: Number(info.remainRewarders),
          leadingZeros: Number(info.leadingZeros),
        } as Challenge;
      });
      const challenges = await Promise.all(promises);
      setChallenges(challenges);
    })();
  }, [challengeC]);

  const handleSelectChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setProof(null);
    setNulifier(null);
    setTxHash(null);
  };

  const handleGenerateProof = async () => {
    if (!selectedChallenge || !account || !provider) return;

    try {
      setIsGenerating(true);
      setError(null);

      const message = "I found a vanity address";
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      const hashedMessage = ethers.hashMessage(message);
      const sigWithoutV = signature.slice(0, 130); // remove 'v'

      const uncompressedPubKey = ethers.SigningKey.recoverPublicKey(
        hashedMessage,
        signature
      );
      const pubKey = uncompressedPubKey.slice(4); // remove '0x04' uncompressed flag prefix
      const pubKeyX = "0x" + pubKey.substring(0, 64);
      const pubKeyY = "0x" + pubKey.substring(64);

      const nulifier = ethers.hexlify(
        blake2s256(ethers.getBytes(signer.address))
      );
      const splitedNulifier = [
        nulifier.slice(0, 34),
        "0x" + nulifier.slice(34),
      ];

      const { proof, publicInputs, witness, verify } = await generateProof({
        pub_key_x: Array.from(ethers.getBytes(pubKeyX)),
        pub_key_y: Array.from(ethers.getBytes(pubKeyY)),
        signature: Array.from(ethers.getBytes(sigWithoutV)),
        hashed_message: Array.from(ethers.getBytes(hashedMessage)),
        leading_zeros: selectedChallenge.leadingZeros,
        nulifier: splitedNulifier,
      });

      const verified = await verify;
      if (!verified) {
        setError("Proof verification failed");
        setProof(null);
        setNulifier(null);
        setIsGenerating(false);
        return;
      }

      setProof(ethers.hexlify(proof));
      setNulifier(nulifier);
      setIsGenerating(false);
    } catch (error) {
      console.error("Failed to generate proof:", error);
      setError(error instanceof Error ? error.message : String(error));
      setProof(null);
      setNulifier(null);
      setIsGenerating(false);
    }
  };

  const handleSubmitProof = async () => {
    if (!proof || !nulifier || !selectedChallenge || !provider || !challengeC)
      return;

    try {
      setIsSubmitting(true);
      const signer = await provider.getSigner();

      const tx = await challengeC
        .connect(signer)
        /// @ts-ignore
        .challenge(selectedChallenge.id, nulifier, proof);

      await tx.wait();

      setTxHash(tx.hash);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Failed to submit proof:", error);
      setError(error instanceof Error ? error.message : String(error));
      setIsSubmitting(false);
      setProof(null);
      setNulifier(null);
      setTxHash(null);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>ZK Vanity Address Challenge</h1>

        <div style={styles.walletInfo}>
          {account ? (
            <>
              <div style={styles.networkBadge}>
                <div style={styles.networkIndicator}></div>
                {getNetworkName(chainId)}
              </div>

              <div style={styles.accountBadge}>
                {formatAddress(account)} •{" "}
                {balance ? Number(balance).toFixed(4) : "0"} ETH
              </div>
            </>
          ) : (
            <button style={styles.connectButton} onClick={connect}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* 왼쪽 패널: 챌린지 목록 */}
        <div style={styles.leftPanel}>
          <h2 style={styles.panelTitle}>Available Challenges</h2>

          <ul style={styles.challengeList}>
            {challenges.map((challenge) => (
              <li
                key={challenge.id}
                style={{
                  ...styles.challengeItem,
                  ...(selectedChallenge?.id === challenge.id
                    ? styles.challengeSelected
                    : {}),
                }}
                onClick={() => handleSelectChallenge(challenge)}
              >
                <input
                  type="checkbox"
                  checked={selectedChallenge?.id === challenge.id}
                  onChange={() => handleSelectChallenge(challenge)}
                />
                <div style={styles.challengeInfo}>
                  <div style={styles.challengeName}>
                    [ID: {challenge.id}] {challenge.leadingZeros} Leading Zeros
                  </div>
                  <div style={styles.challengeDescription}>
                    {challenge.rewards} wei rewards
                  </div>
                  <div style={styles.challengeDescription}>
                    {challenge.remainRewarders} winner remaining
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 오른쪽 패널: Proof 생성 및 제출 */}
        <div style={styles.rightPanel}>
          <h2 style={styles.panelTitle}>Generate & Submit Proof</h2>

          {!account ? (
            <p>Please connect your wallet first</p>
          ) : !selectedChallenge ? (
            <p>Select a challenge from the left panel</p>
          ) : (
            <>
              <div>
                <p>
                  Selected Challenge:{" "}
                  <strong>
                    {selectedChallenge.leadingZeros} Leading Zeros
                  </strong>
                </p>
                <p>
                  submit proof of {selectedChallenge.leadingZeros}leading zeros
                  account
                </p>
              </div>

              <button
                style={{
                  ...styles.buttonLarge,
                  ...(isGenerating ? styles.buttonDisabled : {}),
                }}
                onClick={handleGenerateProof}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span style={styles.loading}>
                    <span>Generating...</span>
                  </span>
                ) : proof ? (
                  "Generate Again"
                ) : error ? (
                  "Try Again"
                ) : (
                  "Generate Proof"
                )}
              </button>

              {/* 에러 메시지 표시 */}
              {error && (
                <div
                  style={{
                    ...styles.proofContainer,
                    backgroundColor: "#fee2e2",
                    border: "1px solid #fca5a5",
                  }}
                >
                  <p
                    style={{
                      ...styles.proofText,
                      color: "#dc2626",
                    }}
                  >
                    Error: {error}
                  </p>
                </div>
              )}

              {/* 성공적으로 생성된 증명만 표시 */}
              {proof && !error && (
                <div style={styles.proofContainer}>
                  <p style={styles.proofText}>{proof}</p>
                </div>
              )}

              {proof && !error && (
                <button
                  style={{
                    ...styles.buttonLarge,
                    ...(isSubmitting || txHash ? styles.buttonDisabled : {}),
                  }}
                  onClick={handleSubmitProof}
                  disabled={isSubmitting || !!txHash}
                >
                  {isSubmitting ? (
                    <span style={styles.loading}>
                      <span>Submitting...</span>
                    </span>
                  ) : txHash ? (
                    "Submitted!"
                  ) : (
                    "Submit Proof"
                  )}
                </button>
              )}

              {txHash && (
                <div style={{ marginTop: "15px" }}>
                  <p style={styles.txSuccess}>
                    ✅ Proof submitted successfully!
                  </p>
                  <p>
                    Transaction:{" "}
                    <a
                      href={
                        txHash && getExplorerUrl(chainId, `tx/${txHash}`)
                          ? getExplorerUrl(chainId, `tx/${txHash}`)
                          : undefined
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#2563eb", textDecoration: "underline" }}
                    >
                      {formatAddress(txHash)}
                    </a>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
