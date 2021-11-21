import { List, Button, Avatar, Row, Tooltip, Space, Col } from "antd";
import React from "react";
import Blockies from "react-blockies";
import ReactTimeAgo from "react-time-ago";
import { CloseOutlined, FormOutlined } from "@ant-design/icons";
import "./OfferList.css";
import { Conditions } from "./index";

export default function OfferList({ offers, post, onRejectOffer, onComposeContract }) {
  console.log(`Render offer list; post: ${JSON.stringify(post)}`);
  return (
    <List
      itemLayout="vertical"
      size="small"
      style={{ border: "1px solid rgba(0, 0, 0, 0.06)", marginTop: "16px" }}
      className="offer-list"
    >
      {offers.map((offer, key) => {
        const { author: contractor, createdAt, status } = offer;
        const statusMessage =
          status === "active" ? (
            <span>Pending</span>
          ) : status === "rejected" ? (
            <span style={{ color: "#b71c1c" }}>Rejected</span>
          ) : (
            <span style={{ color: "#388e3c" }}>Accepted</span>
          );
        const actions = [
          <Tooltip key="reject" position="top" text="Reject offer">
            <Button
              icon={<CloseOutlined />}
              onClick={() => {
                onRejectOffer(offer, post);
              }}
            />
          </Tooltip>,
        ];
        if (post != null && onComposeContract != null) {
          actions.unshift(
            <Tooltip key="compose" position="top" text="Compose the contract">
              <Button
                icon={<FormOutlined />}
                onClick={() => {
                  console.log(`Compose contract with post ${JSON.stringify(post)}`);
                  onComposeContract(offer, post);
                }}
              />
            </Tooltip>,
          );
        }

        return (
          <List.Item key={key} extra={post && post.status !== "signed" && <Space>{actions}</Space>}>
            <List.Item.Meta
              avatar={
                <Avatar
                  size={32}
                  alt={contractor.username}
                  src={contractor.profilePicture || <Blockies seed={contractor.ethAddress.toLowerCase()} />}
                ></Avatar>
              }
              title={contractor.username}
              description={
                <Col span={24}>
                  <Row>
                    <h4 style={{ fontWeight: "bold" }}>Status: {statusMessage}</h4>
                  </Row>
                  {createdAt && (
                    <Row>
                      <ReactTimeAgo date={new Date(createdAt)} locale="en-US" />
                    </Row>
                  )}
                </Col>
              }
              locale="en-US"
            />

            <Conditions title={null} layout="horizontal" conditions={offer} />
          </List.Item>
        );
      })}
    </List>
  );
}
