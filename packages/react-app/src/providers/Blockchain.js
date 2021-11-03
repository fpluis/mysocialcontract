import React, { useContext, useMemo, useState } from "react";
import Moralis from "moralis";
import hardhat_contracts from "../contracts/hardhat_contracts.json";

const { abi: PromotionFactoryABI, address: PromotionFactoryAddress } =
  hardhat_contracts[42].kovan.contracts.PromotionFactory;

export const Blockchain = {
  isReady: false,

  createPromotion: async ({
    ownerAddress,
    mentorAddress,
    thresholdEth,
    startDate,
    secondsAfter,
    mentorCutAsPercentage,
  }) => {
    const result = await Moralis.executeFunction({
      contractAddress: PromotionFactoryAddress,
      functionName: "createPromotion",
      abi: PromotionFactoryABI,
      params: {
        ownerAddress,
        mentorAddress,
        thresholdEth,
        startDate,
        secondsAfter,
        mentorCutAsPercentage,
      },
    });
    console.log(`Create promotion result: ${JSON.stringify(result)}`);
    return result;
  },
};

const BlockchainProviderContext = React.createContext(Blockchain);

export const BlockchainProvider = ({ children = null }) => {
  useMemo(async () => {
    await Moralis.enableWeb3();
    Blockchain.isReady = true;
  }, []);
  return <BlockchainProviderContext.Provider value={Blockchain}>{children}</BlockchainProviderContext.Provider>;
};

export const useBlockchain = () => {
  return useContext(BlockchainProviderContext);
};
