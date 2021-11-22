import React, { useContext, useEffect, useMemo, useState } from "react";
import { useAuthentication, useBlockchain, useRemoteStorage } from ".";
import hardhat_contracts from "../contracts/hardhat_contracts.json";

const { abi: PromotionFactoryABI, address: PromotionFactoryAddress } =
  hardhat_contracts[42].kovan.contracts.PromotionFactory;

const ContractProviderContext = React.createContext({
  contracts: [],
  setContracts: () => {},
  event: {},
  setEvent: () => {},
});

export const MyContractProvider = ({ children = null }) => {
  const {
    user,
    profile: { userId: myUserId },
  } = useAuthentication();
  const blockchain = useBlockchain();
  const [hasLoaded, setHasLoaded] = useState(false);
  const remoteStorage = useRemoteStorage();
  const [promotionFactoryEmitter, setPromotionFactoryEmitter] = useState();
  const [event, setEvent] = useState({ seen: true });
  const [eventEmitters, setEventEmitters] = useState([]);
  const [contracts, setContracts] = useState([]);

  console.log(
    `Use blockchain events with contracts ${JSON.stringify(
      contracts.map(({ contractAddress }) => contractAddress),
    )}; is blockchain ready: ${blockchain.isReady}`,
  );

  useMemo(async () => {
    if (user.authenticated() && myUserId && blockchain.isReady && !hasLoaded) {
      console.log(`LOAD CONTRACTS`);
      setHasLoaded(true);
      const contracts = await remoteStorage.getContracts({ ownerId: myUserId, providerId: myUserId });
      setContracts(contracts);
    }
  }, [user, blockchain.isReady]);

  useEffect(() => {
    if (blockchain.isReady && promotionFactoryEmitter == null) {
      const { events: promotionFactoryListener } = new blockchain.web3.eth.Contract(
        PromotionFactoryABI,
        PromotionFactoryAddress,
      );
      const emitter = promotionFactoryListener.allEvents({}, async function (error, event) {
        console.log(`Promotion factory event: `, event);
        const { event: name, from, returnValues, address } = event;
        const eventProps = { name, address, from, seen: false };
        if (name === "PromotionCreated") {
          const { newPromotionAddress: contractAddress } = returnValues;
          setEvent({ ...eventProps, contractAddress });
        }
      });
      setPromotionFactoryEmitter(emitter);
    }
  }, [blockchain.isReady]);

  useEffect(() => {
    if (!blockchain.isReady) {
      return;
    }

    console.log(`Creating event listeners`);

    eventEmitters.forEach(listener => {
      listener.removeAllListeners();
    });
    const emitters = contracts.map(contract => {
      const { contractAddress } = contract;
      const { events: contractEventListener } = blockchain.getContract(contractAddress);
      return contractEventListener.allEvents({}, async function (error, event) {
        console.log(`Promotion event:`, event);
        const { event: name, from, returnValues, address } = event;
        const eventProps = { name, address, from, seen: false };
        if (name === "OnFulfill") {
          const { _ytSubs: ytSubs, _ytViews: ytViews } = returnValues;
          contract.ytSubs = ytSubs;
          contract.ytViews = ytViews;
          setEvent({ ...eventProps, ytSubs, ytViews });
        }

        if (name === "OnSuccess") {
          contract.isSuccessful = true;
          setEvent({ ...eventProps });
        }

        if (name === "Withdraw") {
          const { amount } = returnValues;
          contract.balance -= Number(amount);
          console.log(`Handling withdraw event; Contract owner: ${contract.ownerId}}; from: ${from}`);
          if (contract.ownerId === from) {
            contract.isOwnerPaid = true;
          } else {
            contract.isProviderPaid = true;
          }

          setEvent({ ...eventProps, amount });
        }

        if (error) {
          console.log("Error handling contract events:", error);
        }

        setContracts([...contracts]);
      });
    });
    setEventEmitters(emitters);
  }, [blockchain.isReady, contracts]);

  return (
    <ContractProviderContext.Provider value={{ contracts, setContracts, event, setEvent }}>
      {children}
    </ContractProviderContext.Provider>
  );
};

export const useMyContracts = () => {
  return useContext(ContractProviderContext);
};
