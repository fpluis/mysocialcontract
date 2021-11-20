import React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Divider, Row, Col } from "antd";
import { MessageOutlined, HomeOutlined, FileTextOutlined, LoginOutlined } from "@ant-design/icons";
import { useAuthentication } from "../providers";
import Blockies from "react-blockies";
import { useThemeSwitcher } from "react-css-theme-switcher";
import "./AppBar.css";

export default function AppBar() {
  const { user, login } = useAuthentication();
  const { currentTheme } = useThemeSwitcher();
  const { ethAddress = "" } = user;
  const pictureObject = user.get("profilePicture");
  const profilePicture = pictureObject ? pictureObject.url() : null;
  console.log(`Profile picture ${JSON.stringify(pictureObject)}; user ${JSON.stringify(user)}`);

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
            <Button icon={<FileTextOutlined className={`icon ${currentTheme}`} />} />
          </Link>
        </Col>
        <Col span={6}>
          <Link to={`/chat/`}>
            <Button icon={<MessageOutlined className={`icon ${currentTheme}`} />} />
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
                    alt={user.authenticated() ? user.getUsername() : ""}
                    src={profilePicture || <Blockies size={38} seed={ethAddress.toLowerCase()} />}
                  ></Avatar>
                }
                shape="circle"
              />
            </Link>
          ) : (
            <Link>
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
      {/* <Row style={{ width: "100%", height: "32px" }}>
        <Divider style={{ width: "100%" }} />
      </Row> */}
    </Col>
  );
}
