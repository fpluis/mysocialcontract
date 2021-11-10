import { List, Button, DatePicker, Avatar, Descriptions, Tooltip, Space } from "antd";
import React from "react";
import Blockies from "react-blockies";
import moment from "moment";
import ReactTimeAgo from "react-time-ago";
import { CloseOutlined, FormOutlined } from "@ant-design/icons";
import "./OfferList.css";

const { RangePicker } = DatePicker;

export default function OfferList({ offers = [], onRejectOffer, onComposeContract }) {
  console.log(`Render offer list with offers ${JSON.stringify(offers)}`);
  return (
    <List
      itemLayout="vertical"
      size="small"
      style={{ border: "1px solid rgba(0, 0, 0, 0.06)", marginTop: "16px" }}
      className="offer-list"
    >
      {offers.map((offer, key) => {
        const { author: contractor, createdAt, share, deposit, startDate, secondsAfter } = offer;
        const actions = [
          <Tooltip key="reject" position="top" text="Reject offer">
            <Button
              icon={<CloseOutlined />}
              onClick={() => {
                onRejectOffer(offer);
              }}
            />
          </Tooltip>,
        ];
        if (onComposeContract != null) {
          actions.unshift(
            <Tooltip key="compose" position="top" text="Compose the contract">
              <Button
                icon={<FormOutlined />}
                onClick={() => {
                  onComposeContract(offer);
                }}
              />
            </Tooltip>,
          );
        }

        return (
          <List.Item key={key} extra={<Space>{actions}</Space>}>
            <List.Item.Meta
              avatar={
                <Avatar
                  size={32}
                  alt={contractor.username}
                  src={contractor.profilePicture || <Blockies seed={contractor.ethAddress.toLowerCase()} />}
                ></Avatar>
              }
              title={contractor.username}
              description={createdAt && <ReactTimeAgo date={new Date(createdAt)} locale="en-US" />}
            />
            <Descriptions title={null} bordered layout="horizontal" column={1}>
              {share && <Descriptions.Item label="Share">{share}%</Descriptions.Item>}
              {deposit && <Descriptions.Item label="Initial deposit">{deposit}</Descriptions.Item>}
              {startDate && secondsAfter && (
                <Descriptions.Item label="Period">
                  <RangePicker
                    defaultValue={[moment(startDate * 1000), moment(startDate * 1000 + secondsAfter * 1000)]}
                    disabled
                  />
                </Descriptions.Item>
              )}
            </Descriptions>
          </List.Item>
        );
      })}
    </List>
  );
}
