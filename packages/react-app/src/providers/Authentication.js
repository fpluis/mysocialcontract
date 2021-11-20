import React, { useContext, useMemo, useState } from "react";
import { MORALIS_SERVER_ID, MORALIS_APP_ID } from "../constants";
import Moralis from "moralis";
import { CustomUser } from "../classes";

Moralis.start({ serverUrl: MORALIS_SERVER_ID, appId: MORALIS_APP_ID });
Moralis.Object.registerSubclass("_User", CustomUser);

const AuthenticationProviderContext = React.createContext({});

export const AuthenticationProvider = ({ children = null }) => {
  let user = CustomUser.current() || { get: () => null, authenticated: () => false };
  const [updatedAt, setUpdatedAt] = useState(user.get("updatedAt") || "");
  const Authentication = {
    user,
    updatedAt,

    login: () => {
      return Moralis.authenticate({ signingMessage: "Log in using Moralis" })
        .then(authenticatedUser => {
          user = authenticatedUser;
          console.log("Authenticated user:", user);
        })
        .catch(error => {
          console.log(error);
        });
    },

    setUserAttribute: async (prop, value, isFile = false) => {
      console.log(`Set user's ${prop}`);
      let actualValue = value;
      if (isFile) {
        const { file } = value;
        actualValue = new Moralis.File(file.name, file);
      }

      user.set(prop, actualValue);
    },

    updateUser: async () => {
      await user.save().then(user => {
        setUpdatedAt(user.get("updatedAt"));
        console.log(`New updated at: ${user.get("updatedAt")}`);
      });
    },
    logOut: () => {
      return CustomUser.logOut();
    },
  };
  return (
    <AuthenticationProviderContext.Provider value={Authentication}>{children}</AuthenticationProviderContext.Provider>
  );
};

export const useAuthentication = () => {
  return useContext(AuthenticationProviderContext);
};
