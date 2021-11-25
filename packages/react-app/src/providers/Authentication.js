import React, { useContext, useEffect, useState } from "react";
import { MORALIS_SERVER_ID, MORALIS_APP_ID } from "../constants";
import Moralis from "moralis";
import { ProfileObject } from "../classes";

const IPFS_ENDPOINT = "https://ipfs.moralis.io:2053/ipfs";
Moralis.start({ serverUrl: MORALIS_SERVER_ID, appId: MORALIS_APP_ID });

const AuthenticationProviderContext = React.createContext({});

export const AuthenticationProvider = ({ children = null }) => {
  let user = Moralis.User.current() || { get: () => null, authenticated: () => false };
  const [profile, setProfile] = useState({ get: () => null, toJSON: () => ({}), updatedAt: null });
  const [updatedAt, setUpdatedAt] = useState(profile.get("updatedAt") || "");

  const getProfile = userId => {
    const query = new Moralis.Query(ProfileObject);
    query.equalTo("userId", userId);
    return query.first();
  };

  useEffect(async () => {
    if (user.authenticated()) {
      const profile = await getProfile(user.id);
      console.log(`Profile in db:`, profile);
      if (profile != null) {
        const achievementsFile = profile.get("achievementsFile");
        if (achievementsFile) {
          const hash = achievementsFile.hash();
          const achievements = await getAchievements(hash);
          profile.set("achievements", achievements);
        }

        setProfile(profile);
      }
    }
  }, [user]);

  const login = () => {
    return Moralis.authenticate({ signingMessage: "Log into Mysocialcontract" })
      .then(async authenticatedUser => {
        user = authenticatedUser;
        let profile = await getProfile(user.id);
        if (profile == null) {
          profile = new ProfileObject({
            ethAddress: user.get("ethAddress"),
            username: user.get("username"),
            userId: user.id,
          });
          const acl = new Moralis.ACL();
          acl.setPublicReadAccess(true);
          acl.setWriteAccess(user.id, true);
          profile.setACL(acl);
          await profile.save();
        }

        console.log("Authenticated user's profile:", profile);
        setProfile(profile);
      })
      .catch(error => {
        console.log(error);
      });
  };

  // const btoa = string => Buffer.from(string).toString("base64");

  const setUserAttribute = async (prop, value, isFile = false, isIPFS = false) => {
    console.log(`Set user's ${prop} for profile`, profile);
    let actualValue = value;
    if (isFile) {
      if (isIPFS) {
        const { title, content } = value;
        actualValue = new Moralis.File(title, { base64: btoa(JSON.stringify(content)) });
        await actualValue.saveIPFS();
      } else {
        const { file } = value;
        actualValue = new Moralis.File(file.name, file);
      }
    }

    // user.set(prop, actualValue);
    profile.set(prop, actualValue);
  };

  const getAchievements = async ipfsHash => {
    const url = `${IPFS_ENDPOINT}/${ipfsHash}`;
    const response = await fetch(url);
    return response.json();
  };

  const putAchievements = async (contract, { ethAddress, youtubeViews, youtubeSubs, twitterFollowers, ethereum }) => {
    // const { achievementsURL: currentAchievements }
    const achievements = {
      address: ethAddress,
    };
    // const current =
    const file = new Moralis.File(`${user.id}-achievements`, { base64: btoa(JSON.stringify(achievements)) });
    await file.saveIPFS();
  };

  const updateUser = async () => {
    await profile.save().then(profile => {
      setUpdatedAt(profile.get("updatedAt"));
      console.log(`New updated at: ${profile.get("updatedAt")}`);
    });
  };

  const logOut = () => {
    return Moralis.User.logOut();
  };

  return (
    <AuthenticationProviderContext.Provider
      value={{
        user,
        profile: profile.toJSON(),
        updatedAt,
        login,
        setUserAttribute,
        getAchievements,
        putAchievements,
        updateUser,
        logOut,
      }}
    >
      {children}
    </AuthenticationProviderContext.Provider>
  );
};

export const useAuthentication = () => {
  return useContext(AuthenticationProviderContext);
};
