import React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button } from "antd";
import { useAuthentication } from "../providers";
import Blockies from "react-blockies";
import { useThemeSwitcher } from "react-css-theme-switcher";

const routeLinkStyle = {
  fontStyle: "normal",
  fontWeight: "normal",
  fontSize: "16px",
  lineHeight: "19px",
  borderWidth: "0px",
};

const Profile = ({ user }) => {
  const { image: profilePicture = null, ethAddress = "" } = user;
  return (
    <Link to={"/profile"}>
      <Button shape="circle" style={{ backgroundColor: "white", padding: 0, ...routeLinkStyle }}>
        <p style={{ display: "none" }}>{profilePicture}</p>
        <Avatar
          size={32}
          alt={user.getUsername()}
          src={profilePicture || <Blockies seed={ethAddress.toLowerCase()} />}
        ></Avatar>
      </Button>
    </Link>
  );
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
        <Button style={routeLinkStyle}>Posts</Button>
      </Link>
    </div>
  );
};

export default function AppBar() {
  const { user, login } = useAuthentication();
  const { currentTheme } = useThemeSwitcher();

  return (
    <>
      <div className="app-left app-bar-box" style={{ background: currentTheme === "light" ? "white" : "#222222" }}>
        <Link to={`/`}>
          <Button style={routeLinkStyle}>
            {/* <img src="/popularize.png" width="48" /> */}
            <p>Popularize</p>
          </Button>
        </Link>
        <RouteLinks />
      </div>
      <div className="app-right app-bar-box">
        {user.authenticated() ? (
          <>
            <Link to={`/post/create`}>
              <Button style={routeLinkStyle}>
                {/* <img src="/popularize.png" width="48" /> */}
                <p>Create</p>
              </Button>
            </Link>
            <Profile key={Date.now()} user={user} />
          </>
        ) : (
          <Button onClick={() => login({ signingMessage: "Log into Popularize" })}>Log in</Button>
        )}
      </div>
    </>
  );
}
