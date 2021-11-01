import Moralis from "moralis";
import React, { useContext, useMemo } from "react";

const RequestObject = Moralis.Object.extend("Request");

export class RemoteStorage {
  putRequest({ title, description, share, threshold }) {
    const request = new RequestObject();
    return request
      .save({
        title,
        description,
        share,
        threshold,
      })
      .then(
        request => {
          console.log(`Object saved successfully, result`, request);
        },
        error => {
          console.log(`Error saving object,`, error);
        },
      );
  }
}

const RemoteStorageProviderContext = React.createContext(RemoteStorage);

export const RemoteStorageProvider = ({ children = null }) => {
  const remoteStorage = useMemo(() => new RemoteStorage(), []);
  return (
    <RemoteStorageProviderContext.Provider value={remoteStorage}>{children}</RemoteStorageProviderContext.Provider>
  );
};

export const useRemoteStorage = () => {
  return useContext(RemoteStorageProviderContext);
};
