import Moralis from "moralis";
import React, { useContext } from "react";
import { useAuthentication, useBlockchain, useLocalStorage } from ".";
import { ProfileObject, OfferObject, PostObject, ContractObject } from "../classes";

const POST_QUERY_LIMIT = 20;

export const RemoteStorage = (LocalStorage = localStorage, Authentication = { user: null }, Blockchain = null) => {
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

    console.log(`User from remote storage: ${JSON.stringify(profile)}`);
    const props = {
      userId: profile.get("userId"),
      username: profile.get("username") || "",
      ethAddress: profile.get("ethAddress"),
    };
    const picture = profile.get("profilePicture");
    console.log(`Get profile of user ${userId}`);
    console.log(`Profile picture: ${JSON.stringify(picture)}`);
    if (picture) {
      props.profilePicture = picture.url();
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
    period,
    ytChannelId,
    ytMinViewCount,
    ytMinSubscriberCount,
  }) => {
    console.log(`Creating post; object id: ${objectId}`);
    const post = new PostObject();
    if (objectId) {
      post.set("objectId", objectId);
    }

    const authorId = Authentication.profile.userId;
    const acl = new Moralis.ACL();
    acl.setPublicReadAccess(true);
    acl.setWriteAccess(authorId, true);
    post.setACL(acl);
    const [start, end] = period;
    return post
      .save({
        status: "active",
        authorId,
        title,
        description,
        initialDeposit,
        thresholdETH,
        startDate: start.unix(),
        endDate: end.unix(),
        share,
        ytChannelId,
        ytMinViewCount,
        ytMinSubscriberCount,
      })
      .then(
        async post => {
          console.log(`Post by ${authorId} saved successfully, result`, post);
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
    return post
      .save({
        id,
        status,
      })
      .then(
        post => {
          console.log(`Post saved successfully, result`, post);
          return post;
        },
        error => {
          console.log(`Error saving object,`, error);
        },
      );
  };

  const getPosts = async ({ status = null, page = 0, authorId = null }) => {
    console.log(`Get posts for page ${page} with params status=${status}`);
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
    console.log(`Posts: ${JSON.stringify(posts)}`);
    const postsWithAuthor = await Promise.all(
      posts.map(async post => {
        const author = await getProfile(post.get("authorId"));
        post.set("author", author);
        return post.toJSON();
      }),
    );
    console.log(`Posts with author ${JSON.stringify(postsWithAuthor)}`);
    postsWithAuthor.forEach(post => {
      console.log(`Serializing post ${post}`);
      LocalStorage.setItem(post.objectId, post);
    });
    return postsWithAuthor;
  };

  const getPost = id => {
    console.log(`Get posts with id ${id}`);
    const cached = LocalStorage.getItem(id);
    if (cached) {
      return cached;
    }

    const query = new Moralis.Query(PostObject);
    return query.first();
  };

  const putOffer = async ({
    postId,
    comment,
    initialDeposit,
    share,
    thresholdETH,
    period,
    ytMinViewCount,
    ytMinSubscriberCount,
  }) => {
    const [start, end] = period;
    const offer = new OfferObject();
    const acl = new Moralis.ACL();
    acl.setPublicReadAccess(true);
    acl.setWriteAccess(Authentication.profile.userId, true);
    offer.setACL(acl);
    return offer
      .save({
        status: "active",
        comment,
        authorId: Authentication.profile.userId,
        postId,
        initialDeposit,
        thresholdETH,
        startDate: start.unix(),
        endDate: end.unix(),
        share,
        ytMinViewCount,
        ytMinSubscriberCount,
      })
      .then(
        offer => {
          console.log(`Object saved successfully, result`, offer);
          return offer;
        },
        error => {
          console.log(`Error saving offer,`, error);
        },
      );
  };

  const setOfferStatus = (id, status) => {
    const offer = new OfferObject();
    return offer
      .save({
        id,
        status,
      })
      .then(
        offer => {
          console.log(`Object saved successfully, result`, offer);
          return offer;
        },
        error => {
          console.log(`Error saving object,`, error);
        },
      );
  };

  const getOffers = async ({ postIds, authorId }) => {
    console.log(`Get offers with params postIds=${postIds}, authorId=${authorId}`);
    const query = new Moralis.Query(OfferObject);
    query.descending("createdAt");
    if (postIds) {
      query.containedIn("postId", postIds);
    }

    if (authorId) {
      query.equalTo("authorId", authorId);
    }

    const offers = await query.find();
    console.log(`Offers: ${JSON.stringify(offers)}`);
    const offersWithAuthor = await Promise.all(
      offers.map(async offer => {
        const author = await getProfile(offer.get("authorId"));
        offer.set("author", author);
        return offer.toJSON();
      }),
    );
    console.log(`Offers with author ${JSON.stringify(offersWithAuthor)}`);
    offersWithAuthor.forEach(offer => {
      console.log(`Serializing offer ${offer}`);
      LocalStorage.setItem(offer.objectId, offer);
    });
    return offersWithAuthor;
  };

  const putContract = async ({ contractAddress, ownerId, providerId }) => {
    const contract = new ContractObject();
    const acl = new Moralis.ACL();
    acl.setPublicReadAccess(true);
    acl.setWriteAccess(Authentication.profile.userId, true);
    contract.setACL(acl);
    return contract
      .save({
        contractAddress,
        ownerId,
        providerId,
      })
      .then(
        async offer => {
          console.log(`Object saved successfully, result`, offer);
          return offer;
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

  const hydrateContract = async contract => {
    console.log(`Hydrating contract ${JSON.stringify(contract)}`);
    const owner = await getProfile(contract.get("ownerId"));
    contract.set("owner", owner);
    const provider = await getProfile(contract.get("providerId"));
    contract.set("provider", provider);
    if (Blockchain.web3) {
      const onChainProps = await Blockchain.getContractProps(contract.get("contractAddress"));
      console.log(`On-chain props:`, onChainProps);
      Object.entries(onChainProps).forEach(([name, value]) => {
        contract.set(name, value);
      });
    }

    const channelId = contract.get("ytChannelId");
    if (channelId !== "-") {
      console.log(`Get statistics for ${channelId}`);
      try {
        const statistics = await Moralis.Cloud.run("getYoutubeStatistics", {
          channelId,
        });
        console.log(`YT Statistics for contract channel ${channelId}: ${JSON.stringify(statistics)}`);
        const { viewCount, subscriberCount } = statistics;
        contract.set("liveYtViewCount", viewCount);
        contract.set("liveYtSubCount", subscriberCount);
      } catch (error) {
        console.log(`Error getting channel stats for ${channelId}:`, error);
      }
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
    console.log(`Get contracts with params ownerId=${ownerId}, providerId=${providerId}`);
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
    console.log(`Contracts with ownerId=${ownerId}, providerId=${providerId}: ${JSON.stringify(contracts)}`);
    const hydratedContracts = await Promise.all(contracts.map(hydrateContract));
    console.log(`Hydrated contracts ${JSON.stringify(hydratedContracts)}`);
    hydratedContracts.forEach(contract => {
      console.log(`Serializing contracts ${contract}`);
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
