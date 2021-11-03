import { Layout } from "antd";
import "antd/dist/antd.css";
import React from "react";
import "./App.css";
import { ThemeSwitch, AppBar } from "./components";
import { Routes } from "./routes";
import { useThemeSwitcher } from "react-css-theme-switcher";

const { Header, Content } = Layout;

export default function App() {
  const { currentTheme } = useThemeSwitcher();

  return (
    <div>
      <Header className="app-bar" style={{ background: currentTheme === "light" ? "white" : "#222222" }}>
        <AppBar />
      </Header>
      <Content style={{ marginLeft: "64px", marginTop: "64px" }}>
        <Routes />
      </Content>
      <ThemeSwitch />
    </div>
  );
}
