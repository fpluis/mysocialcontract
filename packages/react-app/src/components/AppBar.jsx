import React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button } from "antd";
import { PlusCircleOutlined, MessageOutlined } from "@ant-design/icons";
import { useAuthentication } from "../providers";
import Blockies from "react-blockies";
import { useThemeSwitcher } from "react-css-theme-switcher";

const routeLinkStyle = {
  fontStyle: "normal",
  fontWeight: "normal",
  fontSize: "38px",
  lineHeight: "38px",
  height: "38px",
  width: "38px",
  borderWidth: "0px",
  marginRight: "16px",
};

const RouteLinks = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Link to={`/posts`}>
        <Button style={{ ...routeLinkStyle, fontSize: "24px" }}>Posts</Button>
      </Link>
    </div>
  );
};

export default function AppBar() {
  const { user, login } = useAuthentication();
  const { currentTheme } = useThemeSwitcher();
  const { image: profilePicture = null, ethAddress = "" } = user;

  const backgroundColor = currentTheme === "light" ? "white" : "#222222";
  const inverseThemeColor = currentTheme === "light" ? "#222222" : "white";

  return (
    <>
      <div className="app-left app-bar-box" style={{ background: backgroundColor }}>
        <Link to={`/`}>
          <Button style={routeLinkStyle}>
            <img src="/popularize.png" width="38" />
            {/* <p>Popularize</p> */}
          </Button>
        </Link>
        <RouteLinks />
      </div>
      <div className="app-right app-bar-box">
        {user.authenticated() ? (
          <>
            <Link to={`/chat`} style={{ ...routeLinkStyle }}>
              <Button
                style={{ border: "none" }}
                icon={<MessageOutlined style={{ color: inverseThemeColor, fontSize: 38 }} />}
                shape="circle"
              ></Button>
            </Link>
            <Link to={`/post/create`} style={{ ...routeLinkStyle }}>
              <Button
                style={{ border: "none" }}
                icon={<PlusCircleOutlined style={{ color: inverseThemeColor, fontSize: 38 }} />}
                shape="circle"
              ></Button>
            </Link>
            <Link to={"/profile"} style={{ ...routeLinkStyle, fontSize: "1px" }}>
              <Button
                type="default"
                style={{ backgroundColor, border: "none" }}
                icon={
                  <Avatar
                    size={38}
                    alt={user.getUsername()}
                    src={profilePicture || <Blockies size={38} seed={ethAddress.toLowerCase()} />}
                  ></Avatar>
                }
                shape="circle"
              ></Button>
            </Link>
          </>
        ) : (
          <Button
            onClick={async () => {
              const user = await login({ signingMessage: "Log into Popularize" });
              console.log(`Logged in as user ${JSON.stringify(user)}`);
            }}
          >
            Log in
          </Button>
        )}
      </div>
    </>
  );
}
