import React, { useContext, useMemo } from "react";
import { MORALIS_SERVER_ID, MORALIS_APP_ID } from "../constants";
import Moralis from "moralis";
import { CustomUser } from "../classes";

Moralis.start({ serverUrl: MORALIS_SERVER_ID, appId: MORALIS_APP_ID });
Moralis.Object.registerSubclass("_User", CustomUser);

export const Authentication = {
  user: CustomUser.current() || { authenticated: () => false },

  login: () => {
    const user = CustomUser.current();
    if (user) {
      Authentication.user = user;
      return user;
    }

    return Moralis.authenticate({ signingMessage: "Log in using Moralis" })
      .then(user => {
        Authentication.user = user;
        console.log("logged in user:", user);
        console.log(user.get("ethAddress"));
      })
      .catch(error => {
        console.log(error);
      });
  },

  logOut: () => {
    return CustomUser.logOut();
  },
};

const AuthenticationProviderContext = React.createContext({});

export const AuthenticationProvider = ({ children = null }) => {
  return (
    <AuthenticationProviderContext.Provider value={Authentication}>{children}</AuthenticationProviderContext.Provider>
  );
};

export const useAuthentication = () => {
  return useContext(AuthenticationProviderContext);
};
