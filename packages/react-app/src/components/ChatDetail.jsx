import { Button } from "antd";
import React from "react";

export default function ChatList({ chat, onClick }) {
  const { other = { profilePicture: "", username: "John" } } = chat;
  return (
    <li className="person">
      <Button onClick={onClick}>
        <img src={other.profilePicture}></img>
        <span className="name">{other.username}</span>
      </Button>
    </li>
  );
}
