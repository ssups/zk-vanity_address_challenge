import { Provider, ethers, formatEther, getAddress } from "ethers";
import React, { useEffect, useState } from "react";

const useMetaMask = () => {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [chainId, setChainId] = useState<number>(0);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  useEffect(() => {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    init();

    window.ethereum.on("accountsChanged", async (accounts: string) => {
      if (accounts.length === 0) {
        setAccount("");
        setBalance("0");
      } else {
        setAccount(getAddress(accounts[0]));
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [accounts[0]],
        });
        setBalance(formatEther(balance));
      }
    });
    window.ethereum.on("disconnect", (error: any) => {
      alert("network broken change network");
    });
    window.ethereum.on("chainChanged", async (chainId: any) => {
      init();
    });

    return () => {
      delete window.ethereum._events;
    };
  }, []);

  async function init() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

    window.ethereum
      .request({ method: "eth_chainId" })
      .then((chainId: string) => {
        setChainId(parseInt(chainId, 16));
      });

    await window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount("");
          setBalance("0");
          //
        } else {
          setAccount(getAddress(accounts[0])); // eip55 address format
          window.ethereum
            .request({
              method: "eth_getBalance",
              params: [accounts[0]],
            })
            .then((balance: string) => {
              setBalance(formatEther(balance));
            });
        }
      });
  }

  async function connect() {
    if (!window.ethereum) {
      alert("Install MetaMastk");
      return;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (error: any) {
      if (error.code === 4001) alert("connect to MetaMask");
      else alert(error);
    }
  }

  return { account, balance, chainId, provider, connect };
};

export default useMetaMask;
