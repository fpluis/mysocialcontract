const getYoutubeStatistics = async (youtubeApiKey, id) => {
  const logger = Moralis.Cloud.getLogger();
  const ytResponse = await Moralis.Cloud.httpRequest({
    url: "https://youtube.googleapis.com/youtube/v3/channels/",
    params: {
      part: "statistics",
      id,
      key: youtubeApiKey,
    },
    headers: {
      Accept: "application/json",
    },
  });
  logger.info(`Youtube response: ${JSON.stringify(ytResponse)}`);
  const {
    data: { items },
  } = ytResponse;
  const [{ statistics }] = items;
  return statistics;
};

const getYoutubeChannelId = async (youtubeApiKey, name) => {
  const logger = Moralis.Cloud.getLogger();
  const ytResponse = await Moralis.Cloud.httpRequest({
    url: "https://youtube.googleapis.com/youtube/v3/search",
    params: {
      part: "id",
      type: "channel",
      maxResults: 1,
      q: name,
      key: youtubeApiKey,
    },
    headers: {
      Accept: "application/json",
    },
  });
  logger.info(`Youtube response: ${JSON.stringify(ytResponse)}`);
  const {
    data: { items },
  } = ytResponse;
  const [
    {
      id: { channelId },
    },
  ] = items;
  return channelId;
};

const getTwitterFollowers = async (twitterApiKey, username) => {
  const logger = Moralis.Cloud.getLogger();
  const twitterResponse = await Moralis.Cloud.httpRequest({
    url: "https://api.twitter.com/1.1/users/show.json",
    params: {
      screen_name: username,
    },
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${twitterApiKey}`,
    },
  });
  logger.info(`Twitter response: ${JSON.stringify(twitterResponse)}`);
  const {
    data: { followers_count },
  } = twitterResponse;
  logger.info(`Followers: ${followers_count}`);
  return followers_count;
};

Moralis.Cloud.define("getYoutubeStatistics", async (request) => {
  const {
    params: { channelId },
  } = request;
  const logger = Moralis.Cloud.getLogger();
  logger.info(
    `Calling 'getYoutubeViews' with params ${JSON.stringify(request)}`
  );
  const config = await Moralis.Config.get({ useMasterKey: true });
  const youtubeApiKey = config.get("YOUTUBE_API_KEY");
  return getYoutubeStatistics(youtubeApiKey, channelId);
});

Moralis.Cloud.define("getYoutubeChannelId", async (request) => {
  const {
    params: { username },
  } = request;
  const logger = Moralis.Cloud.getLogger();
  logger.info(
    `Calling 'getYoutubeChannelId' with params ${JSON.stringify(request)}`
  );
  const config = await Moralis.Config.get({ useMasterKey: true });
  const youtubeApiKey = config.get("YOUTUBE_API_KEY");
  return getYoutubeChannelId(youtubeApiKey, username);
});

Moralis.Cloud.define("getTwitterFollowers", async (request) => {
  const {
    params: { username },
  } = request;
  const logger = Moralis.Cloud.getLogger();
  logger.info(
    `Calling 'getYoutubeChannelId' with params ${JSON.stringify(request)}`
  );
  const config = await Moralis.Config.get({ useMasterKey: true });
  const twitterApiKey = config.get("TWITTER_API_KEY");
  return getTwitterFollowers(twitterApiKey, username);
});

const setNotification = (userId, notificationName) => {
  const logger = Moralis.Cloud.getLogger();
  logger.info(
    `Setting notification ${notificationName} for ${JSON.stringify(userId)}`
  );
  const query = new Moralis.Query("Notifications");
  query.equalTo("userId", userId);
  return query
    .first()
    .then((notifications) => {
      notifications.set(notificationName, true);
      return notifications.save();
    })
    .catch(function (error) {
      logger.error("Got an error " + error.code + " : " + error.message);
    });
};

Moralis.Cloud.afterSave("Contract", (request) =>
  Promise.all([
    setNotification(request.object.get("ownerId"), "contracts"),
    setNotification(request.object.get("providerId"), "contracts"),
  ])
);

Moralis.Cloud.afterSave("Offer", (request) =>
  new Moralis.Query("Post")
    .get(request.object.get("postId"))
    .then((post) =>
      Promise.all([
        setNotification(request.object.get("authorId"), "offers"),
        setNotification(post.get("authorId"), "requests"),
      ])
    )
);
