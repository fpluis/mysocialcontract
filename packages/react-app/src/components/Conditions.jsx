import { DatePicker, Descriptions } from "antd";
import React from "react";
import moment from "moment";

const { RangePicker } = DatePicker;

export default function Conditions({
  layout = "vertical",
  title = "Conditions",
  column = 1,
  conditions: {
    initialDeposit,
    share,
    thresholdETH,
    startDate,
    endDate,
    ytChannelId,
    ytMinViewCount,
    ytMinSubscriberCount,
  },
}) {
  return (
    <Descriptions title={title} bordered column={column} layout={layout}>
      <Descriptions.Item label="Initial deposit">{initialDeposit}</Descriptions.Item>
      <Descriptions.Item label="Provider's share">{`${share}%`}</Descriptions.Item>
      {thresholdETH && <Descriptions.Item label="Threshold gains (ETH)">{thresholdETH}</Descriptions.Item>}
      <Descriptions.Item label="Period">
        <RangePicker defaultValue={[moment(startDate * 1000), moment(endDate * 1000)]} disabled />
      </Descriptions.Item>
      {ytChannelId && ytChannelId !== "-" && (
        <Descriptions.Item label="Youtube Channel Id">
          {ytChannelId} (<a href={`https://www.youtube.com/channel/${ytChannelId}`}>Link to the channel</a>)
        </Descriptions.Item>
      )}
      {ytMinViewCount && <Descriptions.Item label="Youtube Min Views">{ytMinViewCount} views</Descriptions.Item>}
      {ytMinSubscriberCount && (
        <Descriptions.Item label="Youtube Min Subscribers">{ytMinSubscriberCount} subscribers</Descriptions.Item>
      )}
    </Descriptions>
  );
}
