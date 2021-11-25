import Moralis from "moralis";
import React, { useContext, useEffect, useState } from "react";
import { useAuthentication } from ".";
import { ProfileObject, MessageObject, ChatObject } from "../classes";

const loadMessages = chatId => {
  const query = new Moralis.Query(MessageObject);
  query.ascending("createdAt");
  query.equalTo("chatId", chatId);
  return query.find();
};

const hydrateChat = async (chat, userId) => {
  const object = chat.toJSON();
  const { participants } = object;
  const [otherId] = participants.filter(participant => participant !== userId);
  console.log(`Other participant's id: ${otherId}`);
  const profileQuery = new Moralis.Query(ProfileObject);
  profileQuery.equalTo("userId", otherId);
  const otherAsObject = await profileQuery.first();
  return {
    ...object,
    other: otherAsObject.toJSON(),
    unread: 0,
  };
};

const loadChats = async userId => {
  const query = new Moralis.Query(ChatObject);
  query.ascending("createdAt");
  query.contains("participants", userId);
  const chats = await query.find();
  console.log(`Chats: ${JSON.stringify(chats)}`);
  return Promise.all(chats.map(chat => hydrateChat(chat, userId)));
};

const subscribeToChats = userId => {
  const query = new Moralis.Query(ChatObject);
  query.contains("participants", userId);
  return query.subscribe();
};

const MessagingProviderContext = React.createContext({});

export const MessagingProvider = ({ children = null }) => {
  const {
    user,
    profile: { userId: myUserId },
  } = useAuthentication();
  const [chats, setChats] = useState([]);
  const [hasLoadedChats, setHasLoadedChats] = useState(false);
  const [messageMap, setMessageMap] = useState({});
  const [subscriptionMap, setSubscriptionMap] = useState({});
  const [chatSubscription, setChatSubscription] = useState();
  // const [incomingMessages, setIncomingMessages] = useState();

  const addChat = chat => {
    console.log(`Add chat ${JSON.stringify(chat)} to chats ${JSON.stringify(chats)}`);
    setChats(previousChats => [...previousChats, chat]);
  };

  const addMessages = (chatId, messageObjects) => {
    setMessageMap(messageMap => {
      const current = messageMap[chatId] == null ? [] : messageMap[chatId];
      const messages = messageObjects.map(message => message.toJSON());
      console.log(`Add messages ${JSON.stringify(messages)} to ${JSON.stringify(current)}`);
      const unread = messages.reduce((total, { unread, destinatary }) => {
        return unread && destinatary === myUserId ? total + 1 : total;
      }, 0);
      console.log(`A total of ${unread} unread messages`);

      setChats(currentChats => {
        const chat = currentChats.find(({ objectId }) => objectId === chatId);
        const [lastMessage] =
          messages.length === 0
            ? [{ createdAt: chat.createdAt }]
            : messages.sort(({ createdAt: createdAt1 }, { createdAt: createdAt2 }) => createdAt2 - createdAt1);
        chat.lastMessageDate = lastMessage.createdAt;
        console.log(`Last message: ${JSON.stringify(lastMessage)}`);
        if (unread > 0) {
          chat.unread += unread;
        }

        return [...currentChats];
      });

      return { ...messageMap, [chatId]: current.concat(messages) };
    });
  };

  // useEffect(() => {
  //   if (incomingMessages) {
  //     addMessages(incomingMessages.chatId, incomingMessages.messages);
  //     setIncomingMessages(null);
  //   }
  // }, [incomingMessages]);

  const subscribeToMessages = chatId => {
    const query = new Moralis.Query(MessageObject);
    query.ascending("createdAt");
    query.equalTo("chatId", chatId);
    return query.subscribe().then(subscription => {
      setSubscriptionMap(subscriptionMap => {
        subscription.on("create", messageObject => {
          console.log(`INCOMING MESSAGE: ${JSON.stringify(messageObject.toJSON())}`);
          addMessages(chatId, [messageObject]);
        });
        subscriptionMap[chatId] = subscription;
        return subscriptionMap;
      });
    });
  };

  useEffect(async () => {
    if (!user.authenticated() || !myUserId) {
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

    const loadedChats = await loadChats(myUserId);
    console.log(`Loaded chats: ${JSON.stringify(loadedChats)}`);
    // Order here matters because chats have only truly loaded
    // after they are also set.
    setChats(loadedChats);
    setHasLoadedChats(true);

    loadedChats.forEach(chat => {
      const { objectId: chatId } = chat;
      subscribeToMessages(chatId);
      loadMessages(chatId).then(messages => {
        console.log(`Loaded messages for ${chatId}: ${JSON.stringify(messages)}`);
        addMessages(chatId, messages);
      });
    });

    const subscription = await subscribeToChats(user.id);
    subscription.on("create", async chat => {
      const hydrated = await hydrateChat(chat, user.id);
      const { objectId: chatId, participants } = hydrated;
      console.log(`Chat created:`, hydrated, chatId);
      hydrated.unread = 1;
      addChat(hydrated);
      subscribeToMessages(chatId);
      const userIsChatRecipient = participants[0] === user.id;
      // We only load the messages for a fresh chat if we didn't create it
      // because otherwise the chat's messages will be doubled
      if (userIsChatRecipient) {
        loadMessages(chatId).then(messages => {
          console.log(`Loaded messages for ${chatId}: ${JSON.stringify(messages)}`);
          addMessages(chatId, messages);
        });
      }
    });
    setChatSubscription(subscription);
  }, [user.authenticated(), myUserId]);

  const messagingFunctions = {
    createChat: async (userId, otherId) => {
      const query = new Moralis.Query(ProfileObject);
      query.equalTo("userId", otherId);
      const other = await query.first();
      console.log(`Other participant found for user id ${otherId}: ${JSON.stringify(other)}`);
      return {
        participants: [otherId, userId],
        other: {
          id: otherId,
          profilePicture: other.get("profilePicture"),
          username: other.get("username"),
          ethAddress: other.get("ethAddress"),
        },
      };
    },
    saveChat: async participants => {
      const chat = new ChatObject();
      chat.set("participants", participants);
      const acl = new Moralis.ACL();
      acl.setPublicReadAccess(true);
      acl.setReadAccess(participants[0], true);
      acl.setReadAccess(participants[1], true);
      acl.setWriteAccess(participants[0], true);
      acl.setWriteAccess(participants[1], true);
      chat.setACL(acl);
      return chat.save().then(chat => chat.toJSON());
    },
    setChatAsRead: ({ objectId: chatId }) => {
      console.log(`Setting chat ${chatId} as read`);
      setChats(currentChats => {
        const chat = currentChats.find(({ objectId }) => objectId === chatId);
        chat.unread = 0;
        return [...currentChats];
      });
      const messages = messageMap[chatId] || [];
      return messages
        .filter(({ unread }) => unread === true)
        .forEach(({ objectId }) => {
          new MessageObject({ objectId, unread: false }).save();
        });
    },
    sendMessage: async ({ chatId, content, source, destinatary, isNewChat = false }) => {
      const message = new MessageObject({ chatId, content, source, destinatary, unread: true });
      const acl = new Moralis.ACL();
      acl.setPublicReadAccess(true);
      acl.setReadAccess(source, true);
      acl.setReadAccess(destinatary, true);
      acl.setWriteAccess(source, true);
      acl.setWriteAccess(destinatary, true);
      message.setACL(acl);
      return message
        .save()
        .then(message => {
          if (isNewChat) {
            addMessages(chatId, [message]);
          }

          return message.toJSON();
        })
        .catch(error => {
          console.log(`Error saving message`, error);
        });
    },
  };

  return (
    <MessagingProviderContext.Provider value={{ chats, messageMap, hasLoadedChats, ...messagingFunctions }}>
      {children}
    </MessagingProviderContext.Provider>
  );
};

export const useMessaging = () => {
  return useContext(MessagingProviderContext);
};
