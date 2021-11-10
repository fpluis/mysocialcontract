import Moralis from "moralis";
import React, { useContext, useEffect, useCallback, useState, useMemo } from "react";
import { useAuthentication } from ".";
import { CustomUser, MessageObject, ChatObject } from "../classes";

const loadMessages = chatId => {
  const query = new Moralis.Query(MessageObject);
  query.ascending("createdAt");
  query.equalTo("chatId", chatId);
  return query.find();
};

const subscribeToMessages = chatId => {
  const query = new Moralis.Query(MessageObject);
  query.ascending("createdAt");
  query.equalTo("chatId", chatId);
  return query.subscribe();
};

const loadChats = async userId => {
  const query = new Moralis.Query(ChatObject);
  query.ascending("createdAt");
  query.contains("participants", userId);
  const chats = await query.find();
  console.log(`Chats: ${JSON.stringify(chats)}`);
  return Promise.all(
    chats.map(async chat => {
      const object = chat.toJSON();
      const { participants } = object;
      const [otherId] = participants.filter(participant => participant !== userId);
      // console.log(`Participants in chat ${object.objectId}: ${JSON.stringify(participants)}`);
      const userQuery = new Moralis.Query(CustomUser);
      const other = await userQuery.get(otherId);
      return {
        ...object,
        other: {
          id: other.id,
          profilePicture: other.get("profilePicture"),
          username: other.get("username"),
          ethAddress: other.get("ethAddress"),
        },
      };
    }),
  );
};

const subscribeToChats = userId => {
  const query = new Moralis.Query(ChatObject);
  query.contains("participants", userId);
  return query.subscribe();
};

const MessagingProviderContext = React.createContext({});

export const MessagingProvider = ({ children = null }) => {
  const { user } = useAuthentication();
  const [chats, setChats] = useState([]);
  const [messageMap, setMessageMap] = useState({});
  const [subscriptionMap, setSubscriptionMap] = useState({});
  const [chatSubscription, setChatSubscription] = useState();
  const [incomingMessages, setIncomingMessages] = useState();

  const addChat = chat => {
    setChats([...chats, chat]);
  };

  const addMessages = (chatId, messages) => {
    const current = messageMap[chatId] == null ? [] : messageMap[chatId];
    const parsed = messages.map(message => message.toJSON());
    setMessageMap({ ...messageMap, [chatId]: current.concat(parsed) });
  };

  useEffect(() => {
    if (incomingMessages) {
      addMessages(incomingMessages.chatId, incomingMessages.messages);
      setIncomingMessages(null);
    }
  }, [incomingMessages]);

  useEffect(() => {
    (async () => {
      if (!user.authenticated() || !user.id) {
        return;
      }

      if (chatSubscription) {
        chatSubscription.unsubscribe();
      }

      if (subscriptionMap) {
        [...Object.values(subscriptionMap)].forEach(subscription => {
          subscription.unsubscribe();
        });
        setSubscriptionMap({});
      }

      const loadedChats = await loadChats(user.id);
      setChats(loadedChats);

      loadedChats.forEach(chat => {
        const { objectId: chatId } = chat;
        subscribeToMessages(chatId).then(subscription => {
          subscriptionMap[chatId] = subscription;
          setSubscriptionMap(subscriptionMap);
          subscription.on("create", messageObject => {
            setIncomingMessages({ chatId, messages: [messageObject] });
          });
        });
        loadMessages(chatId).then(messages => {
          setIncomingMessages({ chatId, messages });
        });
      });

      const subscription = await subscribeToChats(user.id);
      subscription.on("create", chat => {
        console.log(`Chat created:`, chat);
        addChat(chat);
      });
      setChatSubscription(subscription);
    })();
  }, []);

  const messagingFunctions = {
    createChat: async (userId, otherId) => {
      const query = new Moralis.Query(CustomUser);
      const other = await query.get(otherId);
      return {
        participants: [otherId, userId],
        other: {
          id: other.id,
          profilePicture: other.get("profilePicture"),
          username: other.get("username"),
          ethAddress: other.get("ethAddress"),
        },
      };
    },
    saveChat: async ({ participants }) => {
      const chat = new ChatObject();
      chat.set("participants", participants);
      return chat.save().then(error => {
        console.log(`Error saving object,`, error);
      });
    },
    sendMessage: async ({ chatId, content, source, destinatary }) => {
      const message = new MessageObject();
      message.set("chatId", chatId);
      message.set("content", content);
      message.set("source", source);
      message.set("destinatary", destinatary);
      return message.save().catch(error => {
        console.log(`Error saving message`, error);
      });
    },
  };

  return (
    <MessagingProviderContext.Provider value={{ chats, messageMap, ...messagingFunctions }}>
      {children}
    </MessagingProviderContext.Provider>
  );
};

export const useMessaging = () => {
  return useContext(MessagingProviderContext);
};
