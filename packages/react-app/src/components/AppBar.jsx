import React from "react";
import { HashRouter, Link } from "react-router-dom";
import { Avatar, Button } from "antd";
import { useAuthentication } from "../providers";
import Blockies from "react-blockies";

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
      <Link to={`/requests`}>
        <Button style={routeLinkStyle}>Requests</Button>
      </Link>
      <Link to={`/contracts`}>
        <Button style={routeLinkStyle}>Contracts</Button>
      </Link>
    </div>
  );
};

export default function AppBar() {
  const { user, login } = useAuthentication();
  return (
    <HashRouter>
      <div className="app-left app-bar-box">
        <Link to={`/`}>
          <Button style={routeLinkStyle}>
            {/* <img src="/popularize.png" width="48" /> */}
            <p>Popularize</p>
          </Button>
        </Link>
        <div
          style={{
            borderLeft: "1px solid #282828",
            width: "2px",
            height: "40px",
            marginRight: "14px",
          }}
        />
        <RouteLinks />
      </div>
      <div className="app-right app-bar-box">
        {user.authenticated() ? (
          <>
            <Link to={`/request/create`}>
              <Button style={routeLinkStyle}>
                {/* <img src="/popularize.png" width="48" /> */}
                <p>Request</p>
              </Button>
            </Link>
            <Profile key={Date.now()} user={user} />
          </>
        ) : (
          <Button onClick={() => login({ signingMessage: "Log into Popularize" })}>Log in</Button>
        )}
      </div>
    </HashRouter>
  );
}
