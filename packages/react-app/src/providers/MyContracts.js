import React, { useCallback, useContext, useEffect, useState } from "react";
import { useAuthentication, useBlockchain, useRemoteStorage } from ".";

const ContractProviderContext = React.createContext({
  contracts: [],
  setContracts: () => {},
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
  const { user, setNotification, profile, setUserAttribute, updateUser } = useAuthentication();
  const { userId: myUserId } = profile;
  const blockchain = useBlockchain();
  const [hasLoaded, setHasLoaded] = useState(false);
  const remoteStorage = useRemoteStorage();
  const [eventEmitters, setEventEmitters] = useState([]);
  const [contractSubscription, setContractSubscription] = useState();
  const [eventMap, setEventMap] = useState({});
  const [contracts, setContracts] = useState([]);
  const [event, setEvent] = useState();

  const handleEvent = useCallback(
    event => {
      const { contract } = event;
      const { event: name, returnValues, address, transactionHash, logIndex } = event;
      const eventKey = `${transactionHash}-${logIndex}`;
      if (eventMap[eventKey] != null) {
        return;
      }

      setEventMap(eventMap => {
        eventMap[eventKey] = true;
        return eventMap;
      });
      if (name === "OnFulfill") {
        const { _ytSubs: ytSubs, _ytViews: ytViews, _twitterFollowers: twitterFollowers } = returnValues;
        contract.ytSubs = ytSubs;
        contract.ytViews = ytViews;
        contract.twitterFollowers = twitterFollowers;
      }

      if (name === "OnSuccess") {
        const { balance } = returnValues;
        contract.isSuccessful = true;
        contract.balanceAtEnd = balance / 1000000000000000000;
        const achievements = toAchievements(myUserId, contracts);
        setUserAttribute(
          "achievementsFile",
          { title: `${myUserId}-achievements.json`, content: achievements },
          true,
          true,
        ).then(() => {
          updateUser();
        });
      }

      if (name === "Withdraw") {
        const { amount, withdrawer } = returnValues;
        contract.balance -= Number(amount);
        if (contract.owner.ethAddress.toLowerCase() === withdrawer.toLowerCase()) {
          contract.isOwnerPaid = true;
        } else {
          contract.isProviderPaid = true;
        }
      }

      setContracts(contracts => [...contracts]);
      setNotification("contracts", true);
    },
    [contracts, eventMap, setNotification, setUserAttribute],
  );

  useEffect(() => {
    if (event) {
      handleEvent(event);
    }
  }, [event]);

  const createEventEmitter = useCallback(
    contract => {
      const { contractAddress } = contract;
      const { events: contractEventListener } = blockchain.getContract(contractAddress);
      const emitter = contractEventListener.allEvents({});
      emitter.on("data", async function (event) {
        event.contract = contract;
        setEvent(event);
      });
      return emitter;
    },
    [contracts],
  );

  useEffect(async () => {
    if (user.authenticated() && myUserId && blockchain.isReady && !hasLoaded) {
      const contracts = await remoteStorage.getContracts({ ownerId: myUserId, providerId: myUserId });
      setContracts(contracts);
      eventEmitters.forEach(listener => {
        listener.removeAllListeners();
      });
      const emitters = contracts.map(createEventEmitter);
      setEventEmitters(emitters);
      if (contractSubscription) {
        contractSubscription.unsubscribe();
      }

      const subscription = await remoteStorage.subscribeToContracts(myUserId);
      subscription.on("create", async contractObject => {
        const contract = await remoteStorage.hydrateContract(contractObject);
        setContracts(currentContracts => {
          return [contract, ...currentContracts];
        });
        setEventEmitters(emitters => [...emitters, createEventEmitter(contract)]);
      });
      setContractSubscription(subscription);
      setHasLoaded(true);
    }
  }, [user.authenticated(), myUserId, blockchain.isReady]);

  return (
    <ContractProviderContext.Provider value={{ contracts, hasLoaded, event }}>
      {children}
    </ContractProviderContext.Provider>
  );
};

export const useMyContracts = () => {
  return useContext(ContractProviderContext);
};
