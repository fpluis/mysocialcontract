import React, { useState, useContext } from "react";

// Adapted from useHooks at (https://usehooks.com/useLocalStorage/)

export const LocalStorage = {
  getItem: (key, ttl) => {
    try {
      const item = window.localStorage.getItem(key);
      if (item == null) {
        return null;
      }

      const parsedItem = JSON.parse(item);
      if (typeof parsedItem === "object" && parsedItem !== null && "expiry" in parsedItem && "value" in parsedItem) {
        const now = new Date();
        if (ttl && now.getTime() > parsedItem.expiry) {
          window.localStorage.removeItem(key);
          return null;
        }

        return parsedItem.value;
      }

      return parsedItem;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  setItem: (key, value, ttl) => {
    try {
      if (ttl) {
        const item = {
          value,
          expiry: new Date().getTime() + ttl,
        };
        window.localStorage.setItem(key, JSON.stringify(item));
      } else {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.log(error);
    }
  },
};

const LocalStorageProviderContext = React.createContext(LocalStorage);

export const LocalStorageProvider = ({ children = null }) => {
  return <LocalStorageProviderContext.Provider value={LocalStorage}>{children}</LocalStorageProviderContext.Provider>;
};

export const useLocalStorage = () => {
  return useContext(LocalStorageProviderContext);
};
