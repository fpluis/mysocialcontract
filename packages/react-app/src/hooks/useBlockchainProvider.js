import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { INFURA_ID } from "../constants";

export const useBlockchainProvider = () => {
  const [mainnetProvider, setMainnetProvider] = useState();

  useEffect(() => {
    const scaffoldEthProvider = navigator.onLine
      ? new ethers.providers.StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544")
      : null;
    const poktMainnetProvider = navigator.onLine
      ? new ethers.providers.StaticJsonRpcProvider(
          "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
        )
      : null;
    const mainnetInfura = navigator.onLine
      ? new ethers.providers.StaticJsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`)
      : null;
    // ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID

    const mainnetProvider =
      poktMainnetProvider && poktMainnetProvider._isProvider
        ? poktMainnetProvider
        : scaffoldEthProvider && scaffoldEthProvider._network
        ? scaffoldEthProvider
        : mainnetInfura;
    setMainnetProvider(mainnetProvider);
  }, []);
  return mainnetProvider;
};
