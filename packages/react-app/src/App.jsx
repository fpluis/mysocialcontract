import { Layout } from "antd";
import "antd/dist/antd.css";
import React from "react";
import "./App.css";
import { ThemeSwitch, AppBar } from "./components";
import { Routes } from "./routes";

const { Header, Content } = Layout;

export default function App() {
  return (
    <div>
      <Header className="app-bar">
        <AppBar />
      </Header>
      <Content>
        <Routes />
      </Content>
      <ThemeSwitch />
    </div>
  );
}
