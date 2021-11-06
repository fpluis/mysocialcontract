import Moralis from "moralis";
import React, { useContext, useEffect, useMemo, useState } from "react";
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
      const object = JSON.parse(JSON.stringify(chat));
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
  console.log(`MESSAGING PROVIDER`);

  const addChat = chat => {
    setChats([...chats, chat]);
  };

  useEffect(() => {
    (async () => {
      if (!user.authenticated() || !user.id) {
        // setIsLoading(true);
        return;
      }

      console.log(`Running use chats memo`);
      setMessageMap({});
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
      console.log(`Loaded chats ${JSON.stringify(loadedChats)}`);
      setChats(loadedChats);

      loadedChats.forEach(chat => {
        console.log(`Subscribing to ${chat.objectId}`);
        subscribeToMessages(chat.objectId).then(subscription => {
          subscriptionMap[chat.objectId] = subscription;
          setSubscriptionMap(subscriptionMap);
          subscription.on("create", message => {
            console.log(`Create event fired: ${JSON.stringify(message)}`);
            const current = messageMap[chat.objectId] || [];
            messageMap[chat.objectId] = [...current, message];
            setMessageMap(messageMap);
          });
        });
      });

      const subscription = await subscribeToChats(user.id);
      subscription.on("create", chat => {
        console.log(`Chat created:`, chat);
        addChat(chat);
        messageMap[chat.objectId] = [];
      });
      console.log(`Loaded chats ${JSON.stringify(loadedChats)}`);
      setChatSubscription(subscription);
    })();
  }, []);

  const messagingFunctions = () => ({
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
      return chat.save().then(
        chat => {
          console.log(`Object saved successfully, result`, chat);
          return chat;
        },
        error => {
          console.log(`Error saving object,`, error);
        },
      );
    },
    sendMessage: async ({ chatId, content, source, destinatary }) => {
      const message = new MessageObject();
      message.set("chatId", chatId);
      message.set("content", content);
      message.set("source", source);
      message.set("destinatary", destinatary);
      return message
        .save()
        .then(() => {
          console.log(`Message saved`, message);
          const current = messageMap[chatId] || [];
          messageMap[chatId] = [...current, message];
        })
        .catch(error => {
          console.log(`Error saving message`, error);
        });
    },
  });

  return (
    <MessagingProviderContext.Provider value={{ chats, messageMap, ...messagingFunctions() }}>
      {children}
    </MessagingProviderContext.Provider>
  );
};

export const useMessaging = () => {
  return useContext(MessagingProviderContext);
};

// export const useChats = userId => {
//   console.log(`Use chats ${userId}`);
//   return useContext(MessagingProviderContext).chats;
// };

export const useMessages = chatId => {
  const { messageMap } = useContext(MessagingProviderContext);
  const [messages, setMessagesLocal] = useState([]);

  const setMessages = messages => {
    setMessagesLocal(messages);
    // eslint-disable-next-line require-atomic-updates
    messageMap[chatId] = messages;
  };

  if (chatId == null) {
    return [messages, setMessages];
  }

  useEffect(async () => {
    if (messageMap[chatId] == null) {
      const loadedMessages = await loadMessages(chatId);
      console.log(`Loaded messages: ${JSON.stringify(loadedMessages)}`);
      setMessagesLocal(loadedMessages);
    } else {
      setMessagesLocal(messageMap[chatId]);
    }
  }, [chatId]);

  return [messages, setMessages];
};
