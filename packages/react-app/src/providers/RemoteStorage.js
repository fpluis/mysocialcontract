import Moralis from "moralis";
import React, { useContext } from "react";
import { useAuthentication, useLocalStorage } from ".";
import { CustomUser, OfferObject, PostObject } from "../classes";

const POST_QUERY_LIMIT = 20;

export const RemoteStorage = (LocalStorage = localStorage, Authentication = { user: null }) => {
  const putPost = ({ title, description, share, threshold }) => {
    const post = new PostObject();
    return post
      .save({
        title,
        description,
        share,
        threshold,
        authorId: Authentication.user.id,
      })
      .then(
        post => {
          console.log(`Object saved successfully, result`, post);
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

    query.ascending("createdAt");
    const posts = await query.find();
    console.log(`Posts: ${JSON.stringify(posts)}`);
    const postsWithAuthor = await Promise.all(
      posts.map(async post => {
        const author = await getUser(post.get("authorId"));
        post.set("author", author);
        return post;
      }),
    );
    console.log(`Posts with author ${JSON.stringify(postsWithAuthor)}`);
    postsWithAuthor.forEach(post => {
      const value = JSON.stringify(post);
      console.log(`Serializing post ${value}`);
      LocalStorage.setItem(value.objectId, value);
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

  const putOffer = async ({ share, startDate, secondsAfter, initialDeposit }) => {
    const offer = new OfferObject();
    return offer
      .save({
        share,
        startDate,
        secondsAfter,
        initialDeposit,
        authorId: Authentication.user.id,
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

  const getOffers = async ({ postId, authorId }) => {
    console.log(`Get offers with params postId=${postId}, authorId=${authorId}`);
    const query = new Moralis.Query(OfferObject);
    query.ascending("createdAt");
    if (postId) {
      query.equalTo("postId", postId);
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
        return offer;
      }),
    );
    console.log(`Offers with author ${JSON.stringify(offersWithAuthor)}`);
    offersWithAuthor.forEach(offer => {
      const value = JSON.stringify(offer);
      console.log(`Serializing offer ${value}`);
      LocalStorage.setItem(value.objectId, value);
    });
    return offersWithAuthor;
  };

  return {
    putPost,
    getUser,
    getPosts,
    getPost,
    putOffer,
    getOffers,
  };
};

const RemoteStorageProviderContext = React.createContext(RemoteStorage());

export const RemoteStorageProvider = ({ children = null }) => {
  const LocalStorage = useLocalStorage();
  const Authentication = useAuthentication();
  console.log(`Auth user: ${JSON.stringify(Authentication.user)}`);
  return (
    <RemoteStorageProviderContext.Provider value={RemoteStorage(LocalStorage, Authentication)}>
      {children}
    </RemoteStorageProviderContext.Provider>
  );
};

export const useRemoteStorage = () => {
  return useContext(RemoteStorageProviderContext);
};
