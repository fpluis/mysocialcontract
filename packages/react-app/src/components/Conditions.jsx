import { TwitterOutlined, YoutubeOutlined } from "@ant-design/icons";
import { Descriptions } from "antd";
import React from "react";
import "./Conditions.css";

export default function Conditions({
  layout = "horizontal",
  title = "Conditions",
  column = 2,
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
    <Descriptions
      className="contract-conditions"
      title={title}
      bordered
      column={column}
      layout={layout}
      style={{ fontSize: "1.2rem" }}
    >
      <Descriptions.Item label="Initial deposit">{initialDeposit}</Descriptions.Item>
      <Descriptions.Item label="Provider's share">{`${share}%`}</Descriptions.Item>
      {thresholdETH && <Descriptions.Item label="Threshold gains (ETH)">{thresholdETH}</Descriptions.Item>}
      <Descriptions.Item label="Deadline">{new Date(endDate * 1000).toLocaleDateString()}</Descriptions.Item>
      {ytChannelId && ytChannelId !== "-" && (
        <Descriptions.Item label="Youtube Channel">
          <a href={`https://www.youtube.com/channel/${ytChannelId}`}>
            <YoutubeOutlined style={{ color: "#e52d27" }} />
          </a>
        </Descriptions.Item>
      )}
      {ytMinViewCount && <Descriptions.Item label="Youtube Min Views">{ytMinViewCount} views</Descriptions.Item>}
      {ytMinSubscriberCount && (
        <Descriptions.Item label="Youtube Min Subscribers">{ytMinSubscriberCount} subscribers</Descriptions.Item>
      )}
      {twitterUsername && twitterUsername !== "-" && (
        <Descriptions.Item label="Twitter Account">
          <a href={`https://twitter.com/${twitterUsername}`}>
            {" "}
            <TwitterOutlined style={{ color: "#1DA1F2" }} />
          </a>
        </Descriptions.Item>
      )}
      {twitterMinFollowers && (
        <Descriptions.Item label="Twitter Min Followers">{twitterMinFollowers} followers</Descriptions.Item>
      )}
    </Descriptions>
  );
}
