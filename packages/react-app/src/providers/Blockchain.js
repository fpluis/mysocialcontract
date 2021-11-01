import React, { useContext, useMemo, useState } from "react";

const BlockchainProviderContext = React.createContext({});

export const BlockchainProvider = ({ children = null }) => {
  return <BlockchainProviderContext.Provider value={{}}>{children}</BlockchainProviderContext.Provider>;
};

export const useBlockchain = () => {
  return useContext(BlockchainProviderContext);
};
