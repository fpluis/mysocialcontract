import Moralis from "moralis";
import React, { useContext } from "react";
import { useAuthentication, useLocalStorage } from ".";
import { CustomUser, PostObject } from "../classes";

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
        },
        error => {
          console.log(`Error saving object,`, error);
        },
      );
  };

  const getUser = id => {
    const query = new Moralis.Query(CustomUser);
    return query.get(id);
  };

  const getPosts = async (params = {}, page = 0) => {
    console.log(`Get posts for page ${page} with params ${JSON.stringify(params)}`);
    const query = new Moralis.Query(PostObject);
    query.limit(POST_QUERY_LIMIT);
    if (page > 0) {
      query.skip(page * POST_QUERY_LIMIT);
    }

    query.ascending("createdAt");
    const posts = await query.find();
    console.log(`Posts: ${JSON.stringify(posts)}`);
    const postsWithAuthor = await Promise.all(
      posts.map(async post => {
        const author = await getUser(post.get("authorId"));
        post.set("author", {
          id: author.id,
          username: author.get("username"),
          ethAddress: author.get("ethAddress"),
        });
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

  return {
    putPost,
    getUser,
    getPosts,
    getPost,
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
