import React from "react";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import ReactDOM from "react-dom";
import {
  MessagingProvider,
  LocalStorageProvider,
  BlockchainProvider,
  AuthenticationProvider,
  RemoteStorageProvider,
  MyContractProvider,
} from "./providers";
import App from "./App";
import "./index.css";
import { HashRouter } from "react-router-dom";

const themes = {
  dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/light-theme.css`,
};

const prevTheme = window.localStorage.getItem("theme");

ReactDOM.render(
  <ThemeSwitcherProvider themeMap={themes} defaultTheme={prevTheme || "light"}>
    <LocalStorageProvider>
      <AuthenticationProvider>
        <BlockchainProvider>
          <RemoteStorageProvider>
            <MyContractProvider>
              <HashRouter basename={"/"}>
                <MessagingProvider>
                  <App />
                </MessagingProvider>
              </HashRouter>
            </MyContractProvider>
          </RemoteStorageProvider>
        </BlockchainProvider>
      </AuthenticationProvider>
    </LocalStorageProvider>
  </ThemeSwitcherProvider>,
  document.getElementById("root"),
);
