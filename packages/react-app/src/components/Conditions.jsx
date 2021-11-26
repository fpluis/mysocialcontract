import { Descriptions } from "antd";
import React from "react";

export default function Conditions({
  layout = "horizontal",
  title = "Conditions",
  column = 1,
  conditions: {
    initialDeposit,
    share,
    thresholdETH,
    endDate,
    ytChannelId,
    ytMinViewCount,
    ytMinSubscriberCount,
    twitterUsername,
    twitterMinFollowers,
  },
}) {
  return (
    <Descriptions title={title} bordered column={column} layout={layout}>
      <Descriptions.Item label="Initial deposit">{initialDeposit}</Descriptions.Item>
      <Descriptions.Item label="Provider's share">{`${share}%`}</Descriptions.Item>
      {thresholdETH && <Descriptions.Item label="Threshold gains (ETH)">{thresholdETH}</Descriptions.Item>}
      <Descriptions.Item label="Deadline">{new Date(endDate * 1000).toLocaleDateString()}</Descriptions.Item>
      {ytChannelId && ytChannelId !== "-" && (
        <Descriptions.Item label="Youtube Channel Id">
          {ytChannelId} (<a href={`https://www.youtube.com/channel/${ytChannelId}`}>Link to the channel</a>)
        </Descriptions.Item>
      )}
      {ytMinViewCount && <Descriptions.Item label="Youtube Min Views">{ytMinViewCount} views</Descriptions.Item>}
      {ytMinSubscriberCount && (
        <Descriptions.Item label="Youtube Min Subscribers">{ytMinSubscriberCount} subscribers</Descriptions.Item>
      )}
      {twitterUsername && twitterUsername !== "-" && (
        <Descriptions.Item label="Twitter Username">
          {twitterUsername} (<a href={`https://twitter.com/${twitterUsername}`}>Link to the account</a>)
        </Descriptions.Item>
      )}
      {twitterMinFollowers && (
        <Descriptions.Item label="Twitter Min Followers">{twitterMinFollowers} followers</Descriptions.Item>
      )}
    </Descriptions>
  );
}
