import React from "react";

export default function ChatWindow({ messages, me, chat }) {
  const {
    other: { username },
  } = chat || { other: {} };
  console.log(`Create chat window with chat=`, chat);
  return (
    <div className="chat">
      <div className="top">
        <span className="name">{username}</span>
      </div>
      {messages.map((message, key) => {
        return (
          <div key={key} className={message.source === me.id ? "bubble me" : "bubble you"}>
            {message.content}
          </div>
        );
      })}
    </div>
  );
}
