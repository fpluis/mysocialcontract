import React, { useContext, useEffect, useMemo, useState } from "react";
import { useAuthentication, useBlockchain, useRemoteStorage } from ".";
// import hardhat_contracts from "../contracts/hardhat_contracts.json";

// const { abi: PromotionFactoryABI, address: PromotionFactoryAddress } =
//   hardhat_contracts[42].kovan.contracts.PromotionFactory;
// const { abi: PromotionABI, address: PromotionAddress } = hardhat_contracts[42].kovan.contracts.Promotion;

const ContractProviderContext = React.createContext({
  contracts: [],
  setContracts: () => {},
  event: {},
  setEvent: () => {},
});

const initRoleAchievements = () => ({ youtubeViews: 0, youtubeSubs: 0, twitterFollowers: 0, ethereum: 0 });

const toAchievements = (userId, contracts) =>
  contracts.reduce(
    (
      achievements,
      {
        isSuccessful,
        ownerId,
        contractAddress,
        ytChannelId,
        ytViews,
        ytSubs,
        twitterUsername,
        twitterFollowers,
        balanceAtEnd,
        initialDeposit,
        initialYoutubeViews,
        initialYoutubeSubs,
        initialTwitterFollowers,
      },
    ) => {
      const role = userId.toLowerCase() === ownerId.toLowerCase() ? "owner" : "provider";
      if (ytChannelId !== "-") {
        const gainedViews = ytViews - initialYoutubeViews;
        if (gainedViews > 0) {
          achievements[role].youtubeViews += gainedViews;
        }

        const gainedSubs = ytSubs - initialYoutubeSubs;
        if (gainedSubs > 0) {
          achievements[role].youtubeSubs += gainedSubs;
        }
      }

      const gainedFollowers = twitterFollowers - initialTwitterFollowers;
      if (twitterUsername !== "-" && gainedFollowers > 0) {
        achievements[role].twitterFollowers += gainedFollowers;
      }

      console.log(`Initial deposit: ${initialDeposit}; balance at end: ${balanceAtEnd}`);
      const gainedEth = balanceAtEnd - initialDeposit;
      if (gainedEth > 0) {
        achievements[role].ethereum += gainedEth;
      }

      const contractAddresses = isSuccessful
        ? [...achievements.contractAddresses, contractAddress]
        : achievements.contractAddresses;
      return { ...achievements, contractAddresses };
    },
    { owner: initRoleAchievements(), provider: initRoleAchievements(), contractAddresses: [] },
  );

export const MyContractProvider = ({ children = null }) => {
  const { user, profile, setUserAttribute, updateUser } = useAuthentication();
  const { userId: myUserId } = profile;
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

  useMemo(() => {
    if (event.name === "OnSuccess") {
      // const contract = contracts.find(({ contractAddress }) => contractAddress === event.address);
      const achievements = toAchievements(myUserId, contracts);
      console.log(
        `Achievements generated from contracts ${JSON.stringify(contracts)}: ${JSON.stringify(achievements)}`,
      );
      setUserAttribute(
        "achievementsFile",
        { title: `${myUserId}-achievements.json`, content: achievements },
        true,
        true,
      ).then(() => {
        updateUser();
      });
    }
  }, [event]);

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
        setContracts(contracts => [...contracts]);
        setEvent({ ...eventProps, ytSubs, ytViews, twitterFollowers });
      }

      if (name === "OnSuccess") {
        const { balance } = returnValues;
        contract.isSuccessful = true;
        contract.balanceAtEnd = balance / 1000000000000000000;
        setContracts(contracts => [...contracts]);
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

        setContracts(contracts => [...contracts]);
        setEvent({ ...eventProps, amount });
      }

      // setContracts(contracts => [...contracts]);
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
      setEventEmitters(emitters);
      const subscription = await remoteStorage.subscribeToContracts(myUserId);
      subscription.on("create", async contract => {
        console.log(` : ${JSON.stringify(contract.toJSON())}`);
        const hydrated = await remoteStorage.hydrateContract(contract);
        setContracts(currentContracts => [hydrated, ...currentContracts]);
        setEvent({ seen: false, name: "PromotionCreated", contractAddress: hydrated.contractAddress });
        createEventEmitter(hydrated);
        setEventEmitters(emitters => [...emitters, createEventEmitter(hydrated)]);
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
