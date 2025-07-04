const networks: Record<number, { name: string; explorer: string }> = {
  1: { name: "Ethereum Mainnet", explorer: "https://etherscan.io/" },
  5: { name: "Goerli Testnet", explorer: "https://goerli.etherscan.io/" },
  11155111: {
    name: "Sepolia Testnet",
    explorer: "https://sepolia.etherscan.io/",
  },
  137: { name: "Polygon Mainnet", explorer: "https://polygonscan.com/" },
  80001: {
    name: "Mumbai Testnet",
    explorer: "https://mumbai.polygonscan.com/",
  },
  42161: { name: "Arbitrum One", explorer: "https://arbiscan.io/" },
  10: { name: "Optimism", explorer: "https://optimistic.etherscan.io/" },
  8453: { name: "Base", explorer: "https://basescan.org/" },
  84532: { name: "Base Sepolia", explorer: "https://sepolia.basescan.org/" },
};

export const getNetworkName = (id: number | undefined) => {
  if (!id) return "Not Connected";
  return networks[id]?.name || `Unknown Network (${id})`;
};

export const getExplorerUrl = (id: number | undefined, path: string) => {
  if (!id) return undefined;
  const base = networks[id]?.explorer;
  if (!base) return undefined;
  if (base.endsWith("/") && path.startsWith("/")) {
    return base + path.slice(1);
  }
  if (!base.endsWith("/") && !path.startsWith("/")) {
    return base + "/" + path;
  }
  return base + path;
};
