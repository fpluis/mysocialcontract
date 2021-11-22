import React, { useContext, useMemo, useState } from "react";
import Moralis from "moralis";
import hardhat_contracts from "../contracts/hardhat_contracts.json";
import { BigNumber } from "@ethersproject/bignumber";
import { useAuthentication } from ".";

const { abi: PromotionFactoryABI, address: PromotionFactoryAddress } =
  hardhat_contracts[42].kovan.contracts.PromotionFactory;
const { abi: PromotionABI } = hardhat_contracts[42].kovan.contracts.Promotion;

const normalizeOnChainValue = (type, value) => {
  switch (type) {
    case "weinumber":
      return value / 1000000000000000000;
    case "number":
      return Number(value);
    case "boolean":
    case "string":
    default:
      return value;
  }
};

export const Blockchain = {
  Authentication: null,
  web3: null,
  createContract: async ({
    owner,
    provider,
    initialDeposit,
    thresholdETH = 0,
    startDate,
    endDate,
    share,
    ytChannelId = "-",
    ytMinViewCount = "0",
    ytMinSubscriberCount = "0",
  }) => {
    const params = {
      owner,
      provider,
      initialDeposit: BigNumber.from(`${initialDeposit * 1000000000000000000}`),
      thresholdETH: BigNumber.from(`${thresholdETH * 1000000000000000000}`),
      startDate,
      endDate,
      share,
      ytChannelId,
      ytMinViewCount,
      ytMinSubscriberCount,
    };
    console.log(
      `Create Promotion with params ${JSON.stringify(params)}; msgvalue: ${Moralis.Units.ETH(
        `${initialDeposit}`,
      )}; Initial deposit arg ${BigNumber.from(`${initialDeposit * 1000000000000000000}`).toString()}`,
    );
    const result = await Moralis.executeFunction({
      contractAddress: PromotionFactoryAddress,
      functionName: "createPromotion",
      abi: PromotionFactoryABI,
      params,
      msgValue: Moralis.Units.ETH(`${initialDeposit}`),
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
  getContractProps: async contractAddress => {
    console.log(`Get conditions of contract at ${contractAddress}`);
    const contract = new Blockchain.web3.eth.Contract(PromotionABI, contractAddress);
    console.log(contract);
    const onChainProps = [
      { type: "weinumber", name: "initialDeposit" },
      { type: "weinumber", name: "thresholdETH" },
      { type: "number", name: "startDate" },
      { type: "number", name: "endDate" },
      { type: "number", name: "share" },
      { type: "number", name: "ytViews" },
      { type: "number", name: "ytSubs" },
      { type: "number", name: "ytMinViewCount" },
      { type: "number", name: "ytMinSubscriberCount" },
      { type: "string", name: "ytChannelId" },
      { type: "bool", name: "isSuccessful" },
      { type: "bool", name: "isProviderPaid" },
      { type: "bool", name: "isOwnerPaid" },
    ];
    const values = await Promise.all(
      onChainProps.map(({ name }) => {
        console.log(`Get ${name}`);
        return contract.methods[name]().call();
      }),
    );
    const balance = await Moralis.Web3API.account
      .getNativeBalance({
        chain: "kovan",
        address: contractAddress,
      })
      .then(({ balance }) => Number(balance));
    return values.reduce(
      (props, rawValue, index) => {
        const { type, name } = onChainProps[index];
        props[name] = normalizeOnChainValue(type, rawValue);
        return props;
      },
      { balance },
    );
  },
  checkConditions: async contract => {
    const { contractAddress } = contract;
    if (contract.ytChannelId !== "-") {
      const linkTransferResult = await Moralis.transfer({
        type: "erc20",
        amount: Moralis.Units.Token("1", "18"),
        receiver: contractAddress,
        contractAddress: "0xa36085F69e2889c224210F603D836748e7dC0088",
      });
      console.log(`0.1 LINK Transfer result: ${JSON.stringify(linkTransferResult)}`);
    }

    const {
      methods: { checkConditions },
    } = new Blockchain.web3.eth.Contract(PromotionABI, contractAddress);
    const ethAddress = Blockchain.Authentication.user.get("ethAddress");
    console.log(`My address ${ethAddress} user:`, Blockchain.Authentication.user);
    return checkConditions().send({ from: ethAddress });
  },
  withdraw: async contractAddress => {
    const withdrawResult = await Moralis.executeFunction({
      contractAddress,
      functionName: "withdraw",
      abi: PromotionABI,
    });
    console.log(`Withdraw result: ${JSON.stringify(withdrawResult)}`);
    return withdrawResult;
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
