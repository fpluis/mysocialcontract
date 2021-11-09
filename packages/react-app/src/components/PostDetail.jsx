import { Button, Col, Modal, Row, DatePicker, InputNumber, Card, Avatar, Descriptions } from "antd";
import React, { useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { useAuthentication, useBlockchain } from "../providers";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { Link } from "react-router-dom";
import Blockies from "react-blockies";

const { Meta } = Card;
const { RangePicker } = DatePicker;

export default function PostDetail({ post }) {
  const { user: me } = useAuthentication();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const blockchain = useBlockchain();
  const { currentTheme } = useThemeSwitcher();

  const { title, description, createdAt, share, threshold, author } = post;
  const [mentorCutAsPercentage, setMentorCut] = useState(share);
  const [startDate, setStartDate] = useState(Math.floor(new Date().getTime() / 1000));
  const [secondsAfter, setSecondsAfter] = useState(120);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    const result = await blockchain.createPromotion({
      ownerAddress: author.ethAddress,
      mentorAddress: me.get("ethAddress"),
      thresholdEth: threshold,
      startDate,
      secondsAfter,
      mentorCutAsPercentage,
    });
    console.log(`Result: ${JSON.stringify(result)}`);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Col span={24}>
      <Card
        size="large"
        style={{ width: 300 }}
        cover={
          <img
            alt={author.username}
            src={author.profilePicture || <Blockies seed={author.ethAddress.toLowerCase()} />}
          />
        }
      >
        <Meta title={title} description={createdAt && <ReactTimeAgo date={new Date(createdAt)} locale="en-US" />} />
      </Card>
      <Row>
        <p style={{ fontSize: "1.4rem", marginTop: "32px", marginBottom: "32px" }}>{description}</p>
      </Row>
      <Descriptions title="Conditions" bordered column={{ sm: 2 }}>
        <Descriptions.Item label="Provider's share">{share}%</Descriptions.Item>
        <Descriptions.Item label="Threshold gains (ETH)">{threshold}</Descriptions.Item>
      </Descriptions>
      <Row style={{ marginTop: "32px" }}>
        <Button onClick={showModal}>Make an offer</Button>
        {author.objectId !== me.id && (
          <Link to={`/chat/${author.objectId}`}>
            <Button>Send a message</Button>
          </Link>
        )}
      </Row>

      <Modal title="Make an offer" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Col span={24}>
          <Row>
            <label className="action-field">
              <span className="field-title" style={{ color: currentTheme === "light" ? "#222222" : "#ddd" }}>
                Duration
              </span>
              <RangePicker
                onChange={value => {
                  const [start, end] = value;
                  const startDate = start.unix();
                  setStartDate(startDate);
                  setSecondsAfter(end.unix() - startDate);
                }}
              />
            </label>
          </Row>

          <Row>
            <label className="action-field">
              <span className="field-title" style={{ color: currentTheme === "light" ? "#222222" : "#ddd" }}>
                Share
              </span>
              <InputNumber
                onChange={value => {
                  setMentorCut(value);
                }}
                defaultValue={mentorCutAsPercentage}
                min={0}
                max={100}
                placeholder="Between 0 and 100"
                style={{ width: "100%" }}
              />
            </label>
          </Row>
        </Col>
      </Modal>
    </Col>
  );
}
