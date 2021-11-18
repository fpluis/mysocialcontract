import React, { useContext, useMemo, useState } from "react";
import Moralis from "moralis";
import hardhat_contracts from "../contracts/hardhat_contracts.json";
import { BigNumber } from "@ethersproject/bignumber";
import { useAuthentication } from ".";

const { abi: PromotionFactoryABI, address: PromotionFactoryAddress } =
  hardhat_contracts[42].kovan.contracts.PromotionFactory;
const { abi: PromotionABI, address: PromotionAddress } = hardhat_contracts[42].kovan.contracts.Promotion;

export const Blockchain = {
  Authentication: null,
  web3: null,
  createContract: async ({
    owner,
    provider,
    thresholdETH,
    startDate,
    endDate,
    share,
    ytChannelId,
    ytMinViewCount,
    ytMinSubscriberCount,
  }) => {
    console.log(ytMinViewCount);
    const params = {
      owner,
      provider,
      thresholdETH: BigNumber.from(`${thresholdETH * 100000000000000000}`),
      startDate,
      endDate,
      share,
      ytChannelId: ytChannelId == null ? "" : ytChannelId,
      ytMinViewCount: "0",
      ytMinSubscriberCount: ytMinSubscriberCount == null ? 0 : ytMinSubscriberCount,
    };
    console.log(`Create contract with params ${JSON.stringify(params)}`);
    const result = await Moralis.executeFunction({
      contractAddress: PromotionFactoryAddress,
      functionName: "createPromotion",
      abi: PromotionFactoryABI,
      params,
    });
    console.log(`Create promotion result: ${JSON.stringify(result)}`);
    const {
      events: {
        PromotionCreated: {
          returnValues: { newPromotionAddress },
        },
      },
    } = result;
    return newPromotionAddress;
  },
  getContract: contractAddress => {
    return new Blockchain.web3.eth.Contract(PromotionABI, contractAddress);
  },
  checkConditions: async contractAddress => {
    const linkTransferResult = await Moralis.transfer({
      type: "erc20",
      amount: Moralis.Units.Token("1", "18"),
      receiver: contractAddress,
      contractAddress: "0xa36085F69e2889c224210F603D836748e7dC0088",
    });
    console.log(`0.1 LINK Transfer result: ${JSON.stringify(linkTransferResult)}`);
    const contract = new Blockchain.web3.eth.Contract(PromotionABI, contractAddress);
    console.log(contract);
    const ethAddress = Blockchain.Authentication.user.get("ethAddress");
    console.log(`My address ${ethAddress} user:`, Blockchain.Authentication.user);
    return contract.methods.checkConditions().send({ from: ethAddress });
  },
};

const BlockchainProviderContext = React.createContext(Blockchain);

export const BlockchainProvider = ({ children = null }) => {
  const Authentication = useAuthentication();
  Blockchain.Authentication = Authentication;
  useMemo(async () => {
    const web3 = await Moralis.enableWeb3();
    Blockchain.web3 = web3;
  });
  return <BlockchainProviderContext.Provider value={Blockchain}>{children}</BlockchainProviderContext.Provider>;
};

export const useBlockchain = () => {
  return useContext(BlockchainProviderContext);
};
