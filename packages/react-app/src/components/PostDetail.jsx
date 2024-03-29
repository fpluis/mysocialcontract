import { Button, Col, Row, Card, message } from "antd";
import React, { useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { useAuthentication, useRemoteStorage } from "../providers";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { Description, OfferModal, Conditions, ProfileBadge } from "./index";
import { Link } from "react-router-dom";

const { Meta } = Card;

export default function PostDetail({ post }) {
  const remoteStorage = useRemoteStorage();
  const { user, profile: myProfile } = useAuthentication();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { currentTheme } = useThemeSwitcher();

  const { objectId, author, authorId, title, description, createdAt } = post;

  const showModal = () => {
    setIsModalVisible(true);
  };

  const putOffer = async props => {
    const result = await remoteStorage.putOffer({ ...props, authorId, postId: objectId });
    setIsModalVisible(false);
    message.success("Offer sent successfully!");
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <Col span={24} style={{ marginBottom: "32px" }}>
      <h1>{title}</h1>
      <Card size="small">
        <Meta
          avatar={<ProfileBadge {...author} />}
          title={author.username}
          description={createdAt && <ReactTimeAgo date={new Date(createdAt)} locale="en-US" />}
        />
      </Card>
      {user.authenticated() && author.userId !== myProfile.userId && (
        <Row style={{ marginTop: "32px" }}>
          <Link to={`/chat/${author.userId}`}>
            <Button>Send a message</Button>
          </Link>
          <Button style={{ marginLeft: "16px" }} onClick={showModal}>
            Make an offer
          </Button>
        </Row>
      )}
      <Row>
        <p style={{ fontSize: "1.4rem", marginTop: "32px", marginBottom: "32px" }}>
          <Description text={description} />
        </p>
      </Row>
      <Conditions conditions={post} />

      <OfferModal title="Make an offer" post={post} visible={isModalVisible} onOk={putOffer} onCancel={closeModal} />
    </Col>
  );
}
