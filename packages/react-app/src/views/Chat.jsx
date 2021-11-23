import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Chat.css";
import { useHistory, useLocation, useParams } from "react-router";
import { useAuthentication, useMessaging } from "../providers";
import "react-chat-elements/dist/main.css";
import { ChatList, MessageList, Input, Button, SideBar } from "react-chat-elements";
import { Row, Col, Empty } from "antd";

// import { useThemeSwitcher } from "react-css-theme-switcher";

export default function ChatView() {
  const { id: destinataryId } = useParams();
  const history = useHistory();
  const location = useLocation();
  const {
    user,
    profile: { userId: myUserId },
  } = useAuthentication();

  const { chats, messageMap, hasLoadedChats, sendMessage, setChatAsRead, createChat, saveChat } = useMessaging();
  const [currentChat, setCurrentChat] = useState();
  const messages =
    currentChat && currentChat.objectId && messageMap[currentChat.objectId] ? messageMap[currentChat.objectId] : [];
  console.log(`Message map: ${JSON.stringify(messageMap)}; messages ${JSON.stringify(messages)}`);
  const [isNewChat, setIsNewChat] = useState(false);
  const textInputRef = useRef(null);

  useMemo(async () => {
    console.log(
      `Run memo; user authed? ${user.authenticated()}; my user id ${myUserId}; has loaded chats ${hasLoadedChats}; current chat ${currentChat}`,
    );
    if (!user.authenticated() || !myUserId || !hasLoadedChats) {
      return;
    }

    if (destinataryId) {
      const existingChat = chats.find(({ participants }) => participants.includes(destinataryId));
      console.log(`Looking for current chat; existing chat: ${JSON.stringify(existingChat)}`);
      if (existingChat) {
        setCurrentChat(existingChat);
      } else {
        const chat = await createChat(myUserId, destinataryId);
        setIsNewChat(true);
        setCurrentChat(chat);
      }
    }
    // else if (chats.length > 0) {
    //   const [firstChat] = chats;
    //   setCurrentChat(firstChat);
    // }
  }, [user, myUserId, destinataryId, chats, hasLoadedChats]);

  useEffect(() => {
    if (currentChat && messageMap[currentChat.objectId] != null) {
      console.log(`Set chat ${JSON.stringify(currentChat)} as read`);
      setChatAsRead(currentChat);
    }
  }, [currentChat, messageMap]);

  const send = useCallback(async () => {
    console.log(`Hit send on input`, textInputRef);
    const {
      current: { input },
    } = textInputRef;
    const { value } = input;
    input.value = "";
    const message = { content: value, source: myUserId, destinatary: destinataryId };
    if (isNewChat) {
      console.log(`Save chat with participants ${JSON.stringify(currentChat.participants)}`);
      return saveChat(currentChat.participants).then(chat => {
        console.log(`Save chat result: ${JSON.stringify(chat)}`);
        console.log(`Message's chat id ${chat.objectId}`);
        message.chatId = chat.objectId;
        setIsNewChat(false);
        return sendMessage({ ...message, isNewChat: true });
      });
    }

    console.log(`Send message; current chat ${JSON.stringify(currentChat)} Messages now ${messages.length}`);
    message.chatId = currentChat.objectId;
    return sendMessage(message);
  }, [textInputRef, currentChat, messages]);

  console.log(`Display chats ${JSON.stringify(chats)};`);
  const chatList = chats.map(chat => ({
    id: chat.objectId,
    title: chat.other.username,
    unread: chat.unread,
    avatar: chat.other.profilePicture.url || "https://avatars.dicebear.com/api/male/john.svg?background=%230000ff",
    avatarFlexible: true,
  }));

  const messageList = messages.map(message => ({
    id: message.objectId,
    forwarded: false,
    removeButton: true,
    theme: "white",
    view: "list",
    type: "text",
    position: message.source === myUserId ? "right" : "left",
    text: message.content,
    date: new Date(message.createdAt),
  }));

  console.log(`Message list: ${JSON.stringify(messageList)}`);

  return (
    <Row className="chat-box">
      <Col span={8}>
        <SideBar
          top={
            chatList.length > 0 && (
              <ChatList
                onClick={({ id: chatId }) => {
                  console.log(`Clicked on chat ${chatId}`);
                  const chat = chats.find(({ objectId }) => objectId === chatId);
                  setCurrentChat(chat);
                  // setChatAsRead(chat);
                  const {
                    other: { userId },
                  } = chat;
                  const newPath = location.pathname.replace(/\/chat\/?(\w+\/?)?/, `/chat/${userId}/`);
                  console.log(`Location pathname: ${location.pathname}; new path ${newPath}`);
                  history.replace({ pathname: newPath });
                }}
                dataSource={chatList}
              />
            )
          }
          center={
            chatList.length === 0 && (
              <Empty style={{ width: "100%" }} description={<span>You haven&apos;t started any chats</span>}></Empty>
            )
          }
        />
      </Col>
      <Col className="chat-right-side" span={16}>
        <MessageList
          className="message-list"
          lockable={true}
          downButtonBadge={10}
          // toBottomHeight={"100%"}
          dataSource={messageList}
        />

        <Input
          placeholder="Type here to send a message."
          defaultValue=""
          ref={textInputRef}
          multiline={true}
          onKeyPress={({ shiftKey, charCode }) => {
            if (charCode === 13) {
              if (shiftKey) {
                return true;
              }

              send();
              return false;
            }

            return null;
          }}
          rightButtons={<Button text="Send" onClick={() => send()} />}
        />
      </Col>
    </Row>
  );
}
