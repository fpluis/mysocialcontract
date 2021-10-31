import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { NETWORKS } from "../constants";

const targetNetwork = NETWORKS.localhost;

export const useLocalProvider = () => {
  const [localProvider, setLocalProvider] = useState();

  useEffect(() => {
    // 🏠 Your local provider is usually pointed at your local blockchain
    const localProviderUrl = targetNetwork.rpcUrl;
    // as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
    // eslint-disable-next-line no-undef
    const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
    console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
    const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);
    setLocalProvider(localProvider);
  }, []);

  return localProvider;
};
