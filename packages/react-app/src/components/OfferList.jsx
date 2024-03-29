import { List, Button, Row, Tooltip, Space, Col, Divider } from "antd";
import React from "react";
import ReactTimeAgo from "react-time-ago";
import { MessageOutlined, CloseOutlined, FormOutlined } from "@ant-design/icons";
import { Conditions, ProfileBadge } from "./index";
import { Link } from "react-router-dom";
import "./OfferList.css";

const renderOffer = ({ offer, post, key, onRejectOffer, onComposeContract, showPostLink }) => {
  const { author: provider, createdAt, status, postId } = offer;
  const statusMessage =
    status === "active" ? (
      <span>Pending</span>
    ) : status === "rejected" ? (
      <span style={{ color: "#b71c1c" }}>Rejected</span>
    ) : (
      <span style={{ color: "#388e3c" }}>Accepted</span>
    );
  const actions = [
    <Tooltip key="reject" position="top" text="Message the user">
      <Link to={`/chat/${provider.userId}`}>
        <Button icon={<MessageOutlined />}></Button>
      </Link>
    </Tooltip>,
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
            onComposeContract(offer, post);
          }}
        />
      </Tooltip>,
    );
  }

  return (
    <List.Item key={key} extra={post && post.status !== "signed" && <Space>{actions}</Space>}>
      <List.Item.Meta
        avatar={<ProfileBadge {...provider} />}
        title={
          <Col span={24}>
            <Row>
              <Col span={showPostLink ? 18 : 24}>
                <h4>{provider.username}</h4>
              </Col>
              {showPostLink && (
                <Col span={6}>
                  <Button style={{ float: "right" }}>
                    <Link to={`/posts/${postId}`}>View Post</Link>
                  </Button>
                </Col>
              )}
            </Row>
          </Col>
        }
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
      <Divider type="horizontal" style={{ marginBottom: "16px" }} />
    </List.Item>
  );
};

export default function OfferList({ offers, post, onRejectOffer, onComposeContract, showPostLink = true }) {
  return (
    <List
      itemLayout="vertical"
      size="small"
      style={{ border: "1px solid rgba(0, 0, 0, 0.06)", marginTop: "16px" }}
      className="offer-list"
      dataSource={offers}
      renderItem={(offer, index) =>
        renderOffer({
          offer,
          post,
          key: index,
          onRejectOffer,
          onComposeContract,
          showPostLink: showPostLink && !offer.status === "accepted",
        })
      }
    ></List>
  );
}
