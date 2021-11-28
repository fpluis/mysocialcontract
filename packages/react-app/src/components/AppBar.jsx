import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Row, Col, Badge } from "antd";
import { MessageOutlined, HomeOutlined, FileTextOutlined, LoginOutlined } from "@ant-design/icons";
import { useAuthentication, useMessaging, useMyContracts } from "../providers";
import Blockies from "react-blockies";
import { useThemeSwitcher } from "react-css-theme-switcher";
import "./AppBar.css";

export default function AppBar() {
  const { user, profile, notifications, login } = useAuthentication();
  const { currentTheme } = useThemeSwitcher();
  const { chats } = useMessaging();
  // const [seenContracts, setSeenContracts] = useState(false);
  // const [seenChat, setSeenChat] = useState(false);
  const [showContractNotification, setShowContractNotification] = useState(false);
  const [showChatNotification, setShowChatNotification] = useState(false);
  const { ethAddress = "", username = "", profilePicture } = profile;
  const profilePictureUrl = profilePicture ? profilePicture.url : null;

  const [route, setRoute] = useState("/");

  useEffect(() => {
    // console.log(`Window route ${window.location.hash.replace(/^#/, "")}`);
    setRoute(window.location.hash.replace(/^#/, ""));
  }, [setRoute, window.location.hash]);

  useEffect(() => {
    console.log(`Notifications: ${JSON.stringify(notifications)}; route ${route}`);
    if (route.startsWith("/posts") || route.startsWith("/me")) {
      setShowContractNotification(false);
    } else if (notifications.contracts === true || notifications.requests === true || notifications.offers === true) {
      setShowContractNotification(true);
    }
  }, [notifications, route]);

  useEffect(() => {
    if (chats.some(({ unread }) => unread > 0) && !route.startsWith("/chat/")) {
      // console.log(`Show appbar chat notification`);
      setShowChatNotification(true);
    }
  }, [chats, route]);

  const backgroundColor = currentTheme === "light" ? "white" : "#222222";

  return (
    <Col span={24} style={{ height: "76px" }}>
      <Row className="app-bar-container">
        <Col span={6}>
          <Link to={`/`}>
            <Button icon={<HomeOutlined className={`icon ${currentTheme}`} />} />
          </Link>
        </Col>
        <Col span={6}>
          <Link to={`/posts/`} style={{ verticalAlign: "-webkit-baseline-middle" }}>
            <Badge dot={showContractNotification}>
              <Button
                className="img-button"
                icon={
                  <svg
                    // src="/mysocialcontract.svg"
                    className={`img ${currentTheme}`}
                    style={{
                      height: "38px",
                      width: "38px",
                      backgroundSize: "38px 38px",
                      backgroundImage: "url(/mysocialcontract.svg)",
                    }}
                  />
                }
                onClick={() => {
                  setShowContractNotification(false);
                }}
              ></Button>
            </Badge>
          </Link>
        </Col>
        <Col span={6}>
          <Link to={`/chat/`}>
            <Badge dot={showChatNotification}>
              <Button
                icon={
                  <MessageOutlined
                    className={`icon ${currentTheme}`}
                    onClick={() => {
                      setShowChatNotification(false);
                    }}
                  />
                }
              />
            </Badge>
          </Link>
        </Col>
        <Col span={6}>
          {user.authenticated() ? (
            <Link to={"/profile/"} style={{ lineHeight: "12px" }}>
              <Button
                type="default"
                style={{ backgroundColor, height: "38px", width: "38px" }}
                icon={
                  <Avatar
                    className={`icon ${currentTheme}`}
                    size={38}
                    alt={username}
                    src={profilePictureUrl || <Blockies size={38} seed={ethAddress.toLowerCase()} />}
                  ></Avatar>
                }
                shape="circle"
              />
            </Link>
          ) : (
            <Link to={"/"}>
              <Button
                icon={<LoginOutlined alt="Log in" className={`icon ${currentTheme}`}></LoginOutlined>}
                onClick={async () => {
                  const user = await login({ signingMessage: "Log into Mysocialcontract" });
                  console.log(`Logged in as user ${JSON.stringify(user)}`);
                }}
              />
            </Link>
          )}
        </Col>
      </Row>
    </Col>
  );
}
