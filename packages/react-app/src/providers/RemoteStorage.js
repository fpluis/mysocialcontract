import Moralis from "moralis";
import React, { useContext, useMemo, useState } from "react";
import { useAuthentication, useBlockchain, useLocalStorage } from ".";
import { CustomUser, OfferObject, PostObject, ContractObject } from "../classes";
import hardhat_contracts from "../contracts/hardhat_contracts.json";

const { abi: PromotionABI } = hardhat_contracts[42].kovan.contracts.Promotion;
const POST_QUERY_LIMIT = 20;

export const RemoteStorage = (LocalStorage = localStorage, Authentication = { user: null }, Blockchain = null) => {
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
    // const post = objectId ? Moralis.Object.fromJSON({ objectId }) : new PostObject();
    const post = new PostObject();
    if (objectId) {
      post.set("objectId", objectId);
    }

    const [start, end] = period;
    return post
      .save({
        authorId: Authentication.user.id,
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
          console.log(`Object saved successfully, result`, post);
          const author = await getUser(post.get("authorId"));
          post.set("author", author);
          return post;
        },
        error => {
          console.log(`Error saving object,`, error);
        },
      );
  };

  const getUser = async id => {
    const query = new Moralis.Query(CustomUser);
    const user = await query.get(id);
    console.log(`User from remote storage: ${JSON.stringify(user)}`);
    const props = {
      objectId: user.id,
      username: user.get("username"),
      ethAddress: user.get("ethAddress"),
    };
    const picture = user.get("profilePicture");
    console.log(`Get user ${id}`);
    console.log(`Profile picture: ${JSON.stringify(picture)}`);
    if (picture) {
      props.profilePicture = picture.url();
    }

    return props;
  };

  const getPosts = async (params = {}, page = 0, authorId = null) => {
    console.log(`Get posts for page ${page} with params ${JSON.stringify(params)}`);
    const query = new Moralis.Query(PostObject);
    query.limit(POST_QUERY_LIMIT);
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
        const author = await getUser(post.get("authorId"));
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
    return offer
      .save({
        status: "active",
        comment,
        authorId: Authentication.user.id,
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
          console.log(`Error saving object,`, error);
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
    query.notEqualTo("status", "rejected");
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
        const author = await getUser(offer.get("authorId"));
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
    return contract
      .save({
        contractAddress,
        ownerId,
        providerId,
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

  const getContracts = async ({ ownerId, providerId }) => {
    console.log(`Get contracts with params ownerId=${ownerId}, providerId=${providerId}`);
    const query = new Moralis.Query(ContractObject);
    query.descending("createdAt");
    if (ownerId) {
      console.log(`Set owner id`);
      query.equalTo("ownerId", ownerId);
    }

    if (providerId) {
      console.log(`Set provider id`);
      query.equalTo("providerId", providerId);
    }

    const contracts = await query.find();
    console.log(`Contracts with ownerId=${ownerId}, providerId=${providerId}: ${JSON.stringify(contracts)}`);
    const hydratedContracts = await Promise.all(
      contracts.map(async contract => {
        const owner = await getUser(contract.get("ownerId"));
        contract.set("owner", owner);
        const provider = await getUser(contract.get("providerId"));
        contract.set("provider", provider);
        if (Blockchain.web3) {
          const onChainProps = await Blockchain.getContractProps(contract.get("contractAddress"));
          console.log(`On-chain props:`, onChainProps);
          Object.entries(onChainProps).forEach(([name, value]) => {
            contract.set(name, value);
          });
        }

        return contract.toJSON();
      }),
    );
    console.log(`Offers with author ${JSON.stringify(hydratedContracts)}`);
    hydratedContracts.forEach(contract => {
      console.log(`Serializing offer ${contract}`);
      LocalStorage.setItem(contract.objectId, contract);
    });
    return hydratedContracts;
  };

  return {
    putPost,
    getUser,
    getPosts,
    getPost,
    putOffer,
    setOfferStatus,
    getOffers,
    putContract,
    getContracts,
  };
};

const RemoteStorageProviderContext = React.createContext(RemoteStorage());

export const RemoteStorageProvider = ({ children = null }) => {
  const LocalStorage = useLocalStorage();
  const Authentication = useAuthentication();
  const Blockchain = useBlockchain();
  console.log(`Auth user: ${JSON.stringify(Authentication.user)}`);
  return (
    <RemoteStorageProviderContext.Provider value={RemoteStorage(LocalStorage, Authentication, Blockchain)}>
      {children}
    </RemoteStorageProviderContext.Provider>
  );
};

export const useRemoteStorage = () => {
  return useContext(RemoteStorageProviderContext);
};
