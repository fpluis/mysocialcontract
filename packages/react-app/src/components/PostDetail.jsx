import { Button, Col, Modal, Row, DatePicker, InputNumber } from "antd";
import React, { useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { useAuthentication, useBlockchain } from "../providers";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { Link } from "react-router-dom";

const { RangePicker } = DatePicker;

export default function PostDetail({ post }) {
  const { user: me } = useAuthentication();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const blockchain = useBlockchain();
  const { currentTheme } = useThemeSwitcher();

  const title = post.get("title");
  const createdAt = post.get("createdAt");
  const description = post.get("description");
  const share = post.get("share");
  const threshold = post.get("threshold");
  const author = post.get("author");

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
      <Row>
        <Button onClick={showModal}>Make offer</Button>
      </Row>
      {author.id !== me.id && (
        <Row>
          <Link to={`/chat/${author.id}`}>
            <Button>Send message</Button>
          </Link>
        </Row>
      )}

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
