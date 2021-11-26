import Moralis from "moralis";
import React, { useContext } from "react";
import { useAuthentication, useBlockchain, useLocalStorage } from ".";
import { ProfileObject, OfferObject, PostObject, ContractObject } from "../classes";

const IPFS_ENDPOINT = "https://ipfs.moralis.io:2053/ipfs";
const POST_QUERY_LIMIT = 8;

export const RemoteStorage = (LocalStorage = localStorage, Authentication = { user: null }, Blockchain = null) => {
  const getAchievements = async ipfsHash => {
    const url = `${IPFS_ENDPOINT}/${ipfsHash}`;
    const response = await fetch(url);
    return response.json();
  };

  const getProfile = async userId => {
    const query = new Moralis.Query(ProfileObject);
    let profile;
    try {
      query.equalTo("userId", userId);
      profile = await query.first();
    } catch (error) {
      console.log(`Error getting profile for ${userId},`, error);
      profile = new ProfileObject({ userId });
    }

    const props = {
      userId: profile.get("userId"),
      username: profile.get("username") || "",
      ethAddress: profile.get("ethAddress"),
    };
    const picture = profile.get("profilePicture");
    if (picture) {
      props.profilePicture = picture.url();
    }

    const achievementsFile = profile.get("achievementsFile");
    if (achievementsFile) {
      const hash = achievementsFile.hash();
      props.achievements = await getAchievements(hash);
    }

    return props;
  };

  const putPost = ({
    objectId,
    title,
    description,
    initialDeposit,
    share,
    thresholdETH,
    endDate,
    ytChannelId,
    ytMinViewCount,
    ytMinSubscriberCount,
    twitterUsername,
    twitterMinFollowers,
  }) => {
    const post = new PostObject();
    if (objectId) {
      post.set("objectId", objectId);
    }

    const authorId = Authentication.profile.userId;
    const acl = new Moralis.ACL();
    acl.setPublicReadAccess(true);
    acl.setWriteAccess(authorId, true);
    post.setACL(acl);
    post.unset("author");
    return post
      .save({
        status: "active",
        authorId,
        title,
        description,
        initialDeposit,
        thresholdETH,
        endDate: endDate.unix(),
        share,
        ytChannelId,
        ytMinViewCount,
        ytMinSubscriberCount,
        twitterUsername,
        twitterMinFollowers,
      })
      .then(
        async post => {
          const author = await getProfile(authorId);
          post.set("author", author);
          return post;
        },
        error => {
          console.log(`Error saving object,`, error);
        },
      );
  };

  const setPostStatus = (id, status) => {
    const post = new PostObject();
    post.unset("author");
    return post
      .save({
        id,
        status,
      })
      .then(
        post => {
          return post;
        },
        error => {
          console.log(`Error saving object,`, error);
        },
      );
  };

  const countPosts = async () => {
    const query = new Moralis.Query(PostObject);
    query.equalTo("status", "active");
    return query.count();
  };

  const getPosts = async ({ status = null, page = 0, authorId = null }) => {
    const query = new Moralis.Query(PostObject);
    query.limit(POST_QUERY_LIMIT);

    if (status != null) {
      query.equalTo("status", status);
    }

    if (page > 0) {
      query.skip(page * POST_QUERY_LIMIT);
    }

    if (authorId != null) {
      query.equalTo("authorId", authorId);
    }

    query.descending("createdAt");
    const posts = await query.find();
    const postsWithAuthor = await Promise.all(
      posts.map(async post => {
        const author = await getProfile(post.get("authorId"));
        post.set("author", author);
        return post.toJSON();
      }),
    );
    postsWithAuthor.forEach(post => {
      LocalStorage.setItem(post.objectId, post);
    });
    return postsWithAuthor;
  };

  const getPost = id => {
    const cached = LocalStorage.getItem(id);
    if (cached) {
      return cached;
    }

    const query = new Moralis.Query(PostObject);
    return query.first();
  };

  const putOffer = async ({
    authorId,
    postId,
    comment,
    initialDeposit,
    share,
    thresholdETH,
    endDate,
    ytMinViewCount,
    ytMinSubscriberCount,
    twitterMinFollowers,
  }) => {
    const offer = new OfferObject();
    const acl = new Moralis.ACL();
    acl.setPublicReadAccess(true);
    // Only the user who receives the offer can modify it
    acl.setWriteAccess(authorId, true);
    offer.setACL(acl);
    offer.unset("author");
    return offer
      .save({
        status: "active",
        comment,
        authorId: Authentication.profile.userId,
        postId,
        initialDeposit,
        thresholdETH,
        endDate: endDate.unix(),
        share,
        ytMinViewCount,
        ytMinSubscriberCount,
        twitterMinFollowers,
      })
      .then(
        offer => {
          return offer;
        },
        error => {
          console.log(`Error saving offer,`, error);
        },
      );
  };

  const setOfferStatus = (id, status) => {
    console.log(`Setting offer status of ${id} as ${status}`);
    const offer = new OfferObject();
    offer.unset("author");
    return offer
      .save({
        id,
        status,
      })
      .then(
        offer => {
          return offer;
        },
        error => {
          console.log(`Error saving object,`, error);
        },
      );
  };

  const getOffers = async ({ postIds, authorId }) => {
    const query = new Moralis.Query(OfferObject);
    query.descending("createdAt");
    if (postIds) {
      query.containedIn("postId", postIds);
    }

    if (authorId) {
      query.equalTo("authorId", authorId);
    }

    const offers = await query.find();
    const offersWithAuthor = await Promise.all(
      offers.map(async offer => {
        const author = await getProfile(offer.get("authorId"));
        offer.set("author", author);
        return offer.toJSON();
      }),
    );
    offersWithAuthor.forEach(offer => {
      console.log(`Serializing offer ${offer}`);
      LocalStorage.setItem(offer.objectId, offer);
    });
    return offersWithAuthor;
  };

  const putContract = async ({ contractAddress, ownerId, providerId, ytChannelId, twitterUsername }) => {
    const contract = new ContractObject({ contractAddress, ownerId, providerId });
    const acl = new Moralis.ACL();
    acl.setPublicReadAccess(true);
    acl.setWriteAccess(Authentication.profile.userId, true);
    contract.setACL(acl);
    if (ytChannelId) {
      const { viewCount, subscriberCount } = await Moralis.Cloud.run("getYoutubeStatistics", {
        channelId: ytChannelId,
      });

      contract.set("initialYoutubeViews", viewCount);
      contract.set("initialYoutubeSubs", subscriberCount);
    }

    if (twitterUsername) {
      const initialTwitterFollowers = await Moralis.Cloud.run("getTwitterFollowers", {
        username: twitterUsername,
      });
      contract.set("initialTwitterFollowers", initialTwitterFollowers);
    }

    return contract.save().then(
      async result => {
        return result;
      },
      error => {
        console.log(`Error saving object,`, error);
      },
    );
  };

  const queryByOwner = ownerId => {
    const query = new Moralis.Query(ContractObject);
    query.equalTo("ownerId", ownerId);
    return query;
  };

  const queryByProvider = providerId => {
    const query = new Moralis.Query(ContractObject);
    query.equalTo("providerId", providerId);
    return query;
  };

  const delay = milliseconds =>
    new Promise(resolve => {
      setTimeout(resolve, milliseconds);
    });

  // The retries are necessary due to the spurious error
  // 'Returned values aren’t valid, did it run Out of Gas?'
  const getPropsWithRetry = (contractAddress, maxTries = 4, tries = 0) => {
    return Blockchain.getContractProps(contractAddress).catch(error => {
      if (tries < maxTries) {
        return delay(1000).then(() => getPropsWithRetry(contractAddress, maxTries, tries + 1));
      }

      console.log(error);
      return {};
    });
  };

  const hydrateContract = async contract => {
    const owner = await getProfile(contract.get("ownerId"));
    contract.set("owner", owner);
    const provider = await getProfile(contract.get("providerId"));
    contract.set("provider", provider);
    if (Blockchain.web3) {
      console.log(`Get contract props of ${JSON.stringify(contract.get("contractAddress"))}`);
      // const onChainProps = await Blockchain.getContractProps(contract.get("contractAddress"));
      const onChainProps = await getPropsWithRetry(contract.get("contractAddress"));
      Object.entries(onChainProps).forEach(([name, value]) => {
        contract.set(name, value);
      });
    }

    const channelId = contract.get("ytChannelId");
    if (channelId !== "-") {
      try {
        const { viewCount, subscriberCount } = await Moralis.Cloud.run("getYoutubeStatistics", {
          channelId,
        });
        contract.set("liveYtViewCount", viewCount);
        contract.set("liveYtSubCount", subscriberCount);
      } catch (error) {
        console.log(`Error getting channel stats for ${channelId}:`, error);
      }
    }

    const twitterUsername = contract.get("twitterUsername");
    if (twitterUsername !== "-") {
      const liveTwitterFollowers = await Moralis.Cloud.run("getTwitterFollowers", {
        username: twitterUsername,
      });
      contract.set("liveTwitterFollowers", liveTwitterFollowers);
    }

    return contract.toJSON();
  };

  // const getContract = async ({ contractId, contractAddress }) => {
  //   const query = new Moralis.Query(ContractObject);
  //   if (contractAddress) {
  //     query.equalTo("contractAddress", contractAddress);
  //     return query.first().then(hydrateContract);
  //   }

  //   return query.get(contractId).then(hydrateContract);
  // };

  const getContracts = async ({ ownerId, providerId }) => {
    if (!ownerId && !providerId) {
      return [];
    }

    let query;
    if (ownerId && !providerId) {
      query = queryByOwner(ownerId);
    }

    if (providerId && !ownerId) {
      query = queryByProvider(providerId);
    }

    if (providerId && ownerId) {
      query = Moralis.Query.or(queryByOwner(ownerId), queryByProvider(providerId));
    }

    query.descending("createdAt");
    const contracts = await query.find();
    const hydratedContracts = await Promise.all(contracts.map(hydrateContract));
    hydratedContracts.forEach(contract => {
      LocalStorage.setItem(contract.objectId, contract);
    });
    return hydratedContracts;
  };

  const subscribeToContracts = userId => {
    const query = Moralis.Query.or(queryByOwner(userId), queryByProvider(userId));
    return query.subscribe();
  };

  return {
    putPost,
    setPostStatus,
    countPosts,
    getPosts,
    getPost,
    putOffer,
    setOfferStatus,
    getOffers,
    putContract,
    hydrateContract,
    getContracts,
    subscribeToContracts,
  };
};

const RemoteStorageProviderContext = React.createContext(RemoteStorage());

export const RemoteStorageProvider = ({ children = null }) => {
  const LocalStorage = useLocalStorage();
  const Authentication = useAuthentication();
  const Blockchain = useBlockchain();
  return (
    <RemoteStorageProviderContext.Provider value={RemoteStorage(LocalStorage, Authentication, Blockchain)}>
      {children}
    </RemoteStorageProviderContext.Provider>
  );
};

export const useRemoteStorage = () => {
  return useContext(RemoteStorageProviderContext);
};
