import React, { useContext, useEffect, useMemo, useState } from "react";
import { useAuthentication, useBlockchain, useRemoteStorage } from ".";
import hardhat_contracts from "../contracts/hardhat_contracts.json";

// const { abi: PromotionFactoryABI, address: PromotionFactoryAddress } =
//   hardhat_contracts[42].kovan.contracts.PromotionFactory;
// const { abi: PromotionABI, address: PromotionAddress } = hardhat_contracts[42].kovan.contracts.Promotion;

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
  const [event, setEvent] = useState({ seen: true });
  const [eventEmitters, setEventEmitters] = useState([]);
  const [eventMap, setEventMap] = useState({});
  const [contracts, setContracts] = useState([]);

  console.log(
    `Use blockchain events with contracts ${JSON.stringify(
      contracts.map(({ contractAddress }) => contractAddress),
    )}; is blockchain ready: ${blockchain.isReady}`,
  );

  const createEventEmitter = contract => {
    const { contractAddress } = contract;
    console.log(`Create emitter for ${contractAddress}`);
    const { events: contractEventListener } = blockchain.getContract(contractAddress);
    const emitter = contractEventListener.allEvents({});
    emitter.on("data", async function (event) {
      console.log(`Incoming event for contract ${contractAddress}:`, event);
      const { event: name, from, returnValues, address, signature } = event;
      if (eventMap[signature] != null) {
        console.log(`Event with sig ${signature} has been handled`);
        return;
      }

      setEventMap(eventMap => {
        eventMap[signature] = true;
        return eventMap;
      });
      console.log(`Promotion event for address ${address}; contract ${JSON.stringify(contract)}:`, event);
      const eventProps = { name, address, from, seen: false };
      if (name === "OnFulfill") {
        const { _ytSubs: ytSubs, _ytViews: ytViews, _twitterFollowers: twitterFollowers } = returnValues;
        contract.ytSubs = ytSubs;
        contract.ytViews = ytViews;
        contract.twitterFollowers = twitterFollowers;
        setEvent({ ...eventProps, ytSubs, ytViews, twitterFollowers });
      }

      if (name === "OnSuccess") {
        contract.isSuccessful = true;
        setEvent({ ...eventProps });
      }

      if (name === "Withdraw") {
        const { amount, withdrawer } = returnValues;
        contract.balance -= Number(amount);
        console.log(`Handling withdraw event; Contract owner: ${contract.owner.ethAddress}; withdrawer: ${withdrawer}`);
        if (contract.owner.ethAddress.toLowerCase() === withdrawer.toLowerCase()) {
          console.log(`Owner is paid`);
          contract.isOwnerPaid = true;
        } else {
          contract.isProviderPaid = true;
        }

        setEvent({ ...eventProps, amount });
      }

      setContracts(contracts => [...contracts]);
    });
    return emitter;
  };

  useMemo(async () => {
    if (user.authenticated() && myUserId && blockchain.isReady && !hasLoaded) {
      console.log(`LOAD CONTRACTS`);
      setHasLoaded(true);
      const contracts = await remoteStorage.getContracts({ ownerId: myUserId, providerId: myUserId });
      console.log(`Creating event emitters for ${contracts.length} contracts`);
      setContracts(contracts);
      eventEmitters.forEach(listener => {
        listener.removeAllListeners();
      });
      // createEventEmitters(contracts);
      const emitters = contracts.map(createEventEmitter);
      // const emitters = createEventEmitter(contracts[0]);
      console.log(`Emitters;`, emitters);
      // setEventEmitters(emitters);
      const subscription = await remoteStorage.subscribeToContracts(myUserId);
      subscription.on("create", async contract => {
        console.log(` : ${JSON.stringify(contract.toJSON())}`);
        const hydrated = await remoteStorage.hydrateContract(contract);
        setContracts(currentContracts => [hydrated, ...currentContracts]);
        setEvent({ seen: false, name: "PromotionCreated", contractAddress: hydrated.contractAddress });
        createEventEmitter(hydrated);
        // setEventEmitters(emitters => [...emitters, createEventEmitter(hydrated)]);
      });
    }
  }, [user, blockchain.isReady]);

  return (
    <ContractProviderContext.Provider value={{ contracts, setContracts, event, setEvent }}>
      {children}
    </ContractProviderContext.Provider>
  );
};

export const useMyContracts = () => {
  return useContext(ContractProviderContext);
};
