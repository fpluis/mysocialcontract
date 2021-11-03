import { Col, Row } from "antd";
import React from "react";
import ReactTimeAgo from "react-time-ago";

export default function PostDetail({ post }) {
  const title = post.get("title");
  const createdAt = post.get("createdAt");
  const description = post.get("description");
  const share = post.get("share");
  const threshold = post.get("threshold");
  return (
    <Col span={24}>
      <Row>
        <h2>{title}</h2>
      </Row>
      <Row>
        <ReactTimeAgo date={new Date(createdAt)} locale="en-US" />
      </Row>
      <Row>
        <p>{description}</p>
      </Row>
      <Row>
        <p>Patron&apos;s share: {share}%</p>
      </Row>
      <Row>
        <p>Threshold gains: {threshold}</p>
      </Row>
    </Col>
  );
}
