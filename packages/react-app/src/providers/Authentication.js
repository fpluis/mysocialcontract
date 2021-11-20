import React, { useContext, useEffect, useState } from "react";
import { MORALIS_SERVER_ID, MORALIS_APP_ID } from "../constants";
import Moralis from "moralis";
import { ProfileObject } from "../classes";

Moralis.start({ serverUrl: MORALIS_SERVER_ID, appId: MORALIS_APP_ID });
// Moralis.Object.registerSubclass("_User", CustomUser);

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
      const profileInDB = await getProfile(user.id);
      console.log(`Profile in db:`, profileInDB);
      if (profileInDB != null) {
        setProfile(profileInDB);
      }
    }
  }, [user]);

  const Authentication = {
    user,
    profile: profile.toJSON(),
    updatedAt,

    login: () => {
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
            await profile.save();
          }

          console.log("Authenticated user's profile:", profile);
          setProfile(profile);
        })
        .catch(error => {
          console.log(error);
        });
    },

    setUserAttribute: async (prop, value, isFile = false) => {
      console.log(`Set user's ${prop} for profile`, profile);
      let actualValue = value;
      if (isFile) {
        const { file } = value;
        actualValue = new Moralis.File(file.name, file);
      }

      // user.set(prop, actualValue);
      profile.set(prop, actualValue);
    },

    updateUser: async () => {
      await profile.save().then(profile => {
        setUpdatedAt(profile.get("updatedAt"));
        console.log(`New updated at: ${profile.get("updatedAt")}`);
      });
    },
    logOut: () => {
      return Moralis.User.logOut();
    },
  };
  return (
    <AuthenticationProviderContext.Provider value={Authentication}>{children}</AuthenticationProviderContext.Provider>
  );
};

export const useAuthentication = () => {
  return useContext(AuthenticationProviderContext);
};
