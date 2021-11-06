import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Chat.css";
import { useParams } from "react-router";
import { useAuthentication, useChats, useMessages, useMessaging } from "../providers";
import { ChatDetail, ChatWindow } from "../components";
import { Input, Spin } from "antd";
// import { useThemeSwitcher } from "react-css-theme-switcher";

export default function ChatView() {
  const { id: destinataryId } = useParams();
  const { user: me } = useAuthentication();

  const { chats, sendMessage, createChat, saveChat } = useMessaging();
  const [currentChat, setCurrentChat] = useState(destinataryId == null ? chats[0] : null);
  const [messages, setMessages] = useMessages(currentChat == null ? null : currentChat.id);
  const [isNewChat, setIsNewChat] = useState(false);

  useMemo(async () => {
    console.log(`Destinatary id: ${destinataryId}; chats ${JSON.stringify(chats)}`);
    if (destinataryId && chats.length > 0) {
      console.log(`Finding existing chat in ${JSON.stringify(chats)}`);
      const existingChat = chats.find(({ participants }) => participants.includes(destinataryId));
      console.log(`Existing chat for ${destinataryId}: ${JSON.stringify(existingChat)}`);
      if (existingChat) {
        setCurrentChat(existingChat);
      } else {
        const chat = await createChat(me.id, destinataryId);
        setIsNewChat(true);
        setCurrentChat(chat);
      }
    } else if (chats.length > 0) {
      const [firstChat] = chats;
      setCurrentChat(firstChat);
    }
  }, [destinataryId, chats]);

  // useMemo(() => {
  //   if (messageMap && currentChat && messageMap[currentChat.id]) {
  //     const newMessages = messageMap[currentChat.id];
  //     setMessages(newMessages);
  //   }
  // }, [messageMap, currentChat]);

  console.log(`Current chat, Messages, Me, My chats`, currentChat, messages, me, chats);

  const onSend = async event => {
    console.log(`Hit send with event`, event);
    const { target } = event;
    const { value } = target;
    target.value = "";
    const message = { content: value, source: me.id, destinatary: destinataryId };
    if (isNewChat) {
      console.log(`Is new chat, creating chat with ${destinataryId}`);
      return saveChat(currentChat).then(chat => {
        message.chatId = chat.objectId;
        setMessages([...messages, message]);
        setIsNewChat(false);
        return sendMessage(message);
      });
    }

    console.log(`Current chat`, currentChat);
    message.chatId = currentChat.objectId;
    setMessages([...messages, message]);
    return sendMessage(message);
  };

  return (
    <div className="wrapper">
      <div className="container">
        <div className="left">
          <ul className="people">
            {chats &&
              chats.map((chat, key) => {
                return <ChatDetail chat={chat} onClick={() => setCurrentChat(chat)} key={key} />;
              })}
          </ul>
        </div>
        <div className="right">
          {currentChat == null ? (
            <Spin />
          ) : (
            <>
              <ChatWindow messages={messages} me={me} chat={currentChat} />
              <Input className="write" type="text" onPressEnter={onSend} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
