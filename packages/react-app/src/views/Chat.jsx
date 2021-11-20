import React, { useCallback, useMemo, useRef, useState } from "react";
import "./Chat.css";
import { useParams } from "react-router";
import { useAuthentication, useMessaging } from "../providers";
import "react-chat-elements/dist/main.css";
import { ChatList, MessageList, Input, Button, SideBar } from "react-chat-elements";
import { Row, Col } from "antd";

// import { useThemeSwitcher } from "react-css-theme-switcher";

export default function ChatView() {
  const { id: destinataryId } = useParams();
  const { profile: myProfile } = useAuthentication();

  const { chats, messageMap, sendMessage, createChat, saveChat } = useMessaging();
  const [currentChat, setCurrentChat] = useState(destinataryId == null ? chats[0] : null);
  const messages =
    currentChat && currentChat.objectId && messageMap[currentChat.objectId] ? messageMap[currentChat.objectId] : [];
  const [isNewChat, setIsNewChat] = useState(false);
  const textInputRef = useRef(null);

  useMemo(async () => {
    if (destinataryId && chats.length > 0) {
      const existingChat = chats.find(({ participants }) => participants.includes(destinataryId));
      if (existingChat) {
        setCurrentChat(existingChat);
      } else {
        const chat = await createChat(myProfile.userId, destinataryId);
        setIsNewChat(true);
        setCurrentChat(chat);
      }
    } else if (chats.length > 0) {
      const [firstChat] = chats;
      setCurrentChat(firstChat);
    }
  }, [destinataryId, chats]);

  const sendMemoized = useCallback(() => {
    return async () => {
      console.log(`Hit send on input`, textInputRef);
      const {
        current: { input },
      } = textInputRef;
      const { value } = input;
      input.value = "";
      const message = { content: value, source: myProfile.userId, destinatary: destinataryId };
      if (isNewChat) {
        return saveChat(currentChat).then(chat => {
          message.chatId = chat.objectId;
          setIsNewChat(false);
          return sendMessage(message);
        });
      }

      console.log(`Messages now ${messages.length}`);
      message.chatId = currentChat.objectId;
      return sendMessage(message);
    };
  }, [textInputRef, currentChat, messages]);

  const chatList = chats.map(chat => ({
    id: chat.objectId,
    avatar: chat.other.profilePicture || "https://avatars.dicebear.com/api/male/john.svg?background=%230000ff",
    avatarFlexible: true,
  }));

  const messageList = messages.map(message => ({
    id: message.objectId,
    forwarded: false,
    removeButton: true,
    theme: "white",
    view: "list",
    type: "text",
    position: message.source === myProfile.userId ? "right" : "left",
    text: message.content,
    date: new Date(message.createdAt),
  }));

  return (
    <Row className="chat-box">
      <Col span={8}>
        <SideBar top={<ChatList dataSource={chatList} />} />
      </Col>
      <Col span={16}>
        <MessageList
          className="message-list"
          lockable={true}
          downButtonBadge={10}
          toBottomHeight={"100%"}
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

              sendMemoized()();
              return false;
            }

            return null;
          }}
          rightButtons={<Button text="Send" onClick={() => sendMemoized()()} />}
        />
      </Col>
    </Row>
  );
}
