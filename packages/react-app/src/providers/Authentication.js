import React, { useContext, useCallback, useEffect, useState } from "react";
import { MORALIS_SERVER_ID, MORALIS_APP_ID } from "../constants";
import Moralis from "moralis";
import { NotificationsObject, ProfileObject } from "../classes";

const IPFS_ENDPOINT = "https://ipfs.moralis.io:2053/ipfs";
Moralis.start({ serverUrl: MORALIS_SERVER_ID, appId: MORALIS_APP_ID });

const AuthenticationProviderContext = React.createContext({});

export const AuthenticationProvider = ({ children = null }) => {
  let user = Moralis.User.current() || { get: () => null, authenticated: () => false };
  const [profile, setProfile] = useState({ get: () => null, toJSON: () => ({}), updatedAt: null });
  const [updatedAt, setUpdatedAt] = useState(profile.get("updatedAt") || "");
  const [notifications, setNotifications] = useState({
    get: () => {},
    set: () => {},
    save: () => {},
    toJSON: () => ({ userId: "", requests: false, offers: false, contracts: false }),
  });
  const [notificationsSubscription, setNotificationsSubscription] = useState();

  const getProfile = userId => {
    const query = new Moralis.Query(ProfileObject);
    query.equalTo("userId", userId);
    return query.first();
  };

  const getNotifications = userId => {
    const query = new Moralis.Query(NotificationsObject);
    query.equalTo("userId", userId);
    return query.first();
  };

  const setNotification = useCallback(
    async (notificationName, value = false) => {
      if (notifications.get(notificationName) !== value) {
        notifications.set(notificationName, value);
        await notifications.save();
      }

      // No need to set the notifications locally because
      // they will be updated after the server subscription hook
      // setNotifications(notifications);
    },
    [notifications],
  );

  const subscribeToNotifications = userId => {
    const query = new Moralis.Query(NotificationsObject);
    query.equalTo("userId", userId);
    return query.subscribe();
  };

  useEffect(async () => {
    if (user.authenticated()) {
      const profile = await getProfile(user.id);
      if (profile != null) {
        const achievementsFile = profile.get("achievementsFile");
        if (achievementsFile) {
          const hash = achievementsFile.hash();
          const achievements = await getAchievements(hash);
          profile.set("achievements", achievements);
        }

        setProfile(profile);
      }

      const notifications = await getNotifications(user.id);
      setNotifications(notifications);
      if (notificationsSubscription) {
        notificationsSubscription.unsubscribe();
      }

      const subscription = await subscribeToNotifications(user.id);
      subscription.on("update", notifications => {
        setNotifications(notifications);
      });
      setNotificationsSubscription(subscription);
    }
  }, [user]);

  const login = () => {
    return Moralis.authenticate({ signingMessage: "Log into Mysocialcontract" })
      .then(async authenticatedUser => {
        user = authenticatedUser;
        let profile = await getProfile(user.id);
        if (profile == null) {
          const achievementsFile = new Moralis.File(`${user.id}-achievements.json`, {
            base64: btoa(
              JSON.stringify({
                owner: {
                  youtubeViews: 0,
                  youtubeSubs: 0,
                  twitterFollowers: 0,
                  ethereum: 0,
                },
                provider: {
                  youtubeViews: 0,
                  youtubeSubs: 0,
                  twitterFollowers: 0,
                  ethereum: 0,
                },
                contractAddresses: [],
              }),
            ),
          });
          await achievementsFile.saveIPFS();
          profile = new ProfileObject({
            ethAddress: user.get("ethAddress"),
            username: user.get("username"),
            userId: user.id,
            achievementsFile,
          });
          const acl = new Moralis.ACL();
          acl.setPublicReadAccess(true);
          acl.setWriteAccess(user.id, true);
          profile.setACL(acl);
          await profile.save();
        }

        let notifications = await getNotifications(user.id);
        if (notifications == null) {
          notifications = new NotificationsObject({
            requests: false,
            offers: false,
            contracts: false,
            userId: user.id,
          });
          setNotifications(notifications);
          notifications.save();
        }

        setProfile(profile);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const setUserAttribute = useCallback(
    async (prop, value, isFile = false, isIPFS = false) => {
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

      profile.set(prop, actualValue);
    },
    [profile],
  );

  const getAchievements = async ipfsHash => {
    const url = `${IPFS_ENDPOINT}/${ipfsHash}`;
    const response = await fetch(url);
    return response.json();
  };

  const updateUser = useCallback(async () => {
    profile.unset("achievements");
    await profile.save().then(profile => {
      setUpdatedAt(profile.get("updatedAt"));
    });
  }, [profile]);

  const logOut = () => {
    return Moralis.User.logOut();
  };

  return (
    <AuthenticationProviderContext.Provider
      value={{
        user,
        profile: profile.toJSON(),
        notifications: notifications.toJSON(),
        setNotification,
        updatedAt,
        login,
        setUserAttribute,
        getAchievements,
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
