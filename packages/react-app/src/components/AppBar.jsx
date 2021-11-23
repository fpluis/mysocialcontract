import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Row, Col, Badge } from "antd";
import { MessageOutlined, HomeOutlined, FileTextOutlined, LoginOutlined } from "@ant-design/icons";
import { useAuthentication, useMessaging, useMyContracts } from "../providers";
import Blockies from "react-blockies";
import { useThemeSwitcher } from "react-css-theme-switcher";
import "./AppBar.css";

export default function AppBar() {
  const { user, profile, login } = useAuthentication();
  const { currentTheme } = useThemeSwitcher();
  const { event: contractEvent } = useMyContracts();
  const { chats } = useMessaging();
  const [seenContracts, setSeenContracts] = useState(false);
  // const [seenChat, setSeenChat] = useState(false);
  const [showContractNotification, setShowContractNotification] = useState(false);
  const [showChatNotification, setShowChatNotification] = useState(false);
  const { ethAddress = "", username = "", profilePicture } = profile;
  console.log(`Profile picture ${JSON.stringify(profilePicture)}; profile ${JSON.stringify(profile)}`);
  const profilePictureUrl = profilePicture ? profilePicture.url : null;

  const [route, setRoute] = useState("/");

  useEffect(() => {
    console.log(`Window route ${window.location.hash.replace(/^#/, "")}`);
    setRoute(window.location.hash.replace(/^#/, ""));
  }, [setRoute, window.location.hash]);

  useEffect(() => {
    console.log(`Run effect with contract seen? ${contractEvent.seen}; local seen ${seenContracts}; route: ${route}`);
    if (!contractEvent.seen && !seenContracts && !route.startsWith("/posts") && !route.startsWith("/me")) {
      console.log(`Show appbar contract notification`);
      setShowContractNotification(true);
      setSeenContracts(false);
    }
  }, [contractEvent, route]);

  useEffect(() => {
    console.log(`Run effect with chats ${JSON.stringify(chats)}; route: ${route}`);
    if (chats.some(({ unread }) => unread > 0) && !route.startsWith("/chat/")) {
      console.log(`Show appbar chat notification`);
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
          <Link to={`/posts/`}>
            <Badge dot={showContractNotification}>
              <Button
                icon={
                  <FileTextOutlined
                    className={`icon ${currentTheme}`}
                    onClick={() => {
                      setSeenContracts(true);
                      setShowContractNotification(false);
                    }}
                  />
                }
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
                      // setSeenChat(true);
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
