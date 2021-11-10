import { Button, Col, Modal, Row, DatePicker, InputNumber, Card, Descriptions, Avatar } from "antd";
import React, { useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { useAuthentication, useRemoteStorage } from "../providers";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { Description } from "./index";
import { Link } from "react-router-dom";
import Blockies from "react-blockies";
import moment from "moment";

const { Meta } = Card;
const { RangePicker } = DatePicker;

const OfferModal = ({ currentTheme, visible, onOk, onCancel, initialValues: { share: initialShare } }) => {
  const [share, setShare] = useState(initialShare);
  const [startDate, setStartDate] = useState(Math.floor(new Date().getTime() / 1000));
  const [secondsAfter, setSecondsAfter] = useState(120);
  const [initialDeposit, setInitialDeposit] = useState(0);

  return (
    <Modal
      title="Make an offer"
      visible={visible}
      onOk={() => onOk({ share, startDate, secondsAfter, initialDeposit })}
      onCancel={onCancel}
    >
      <Col span={24}>
        <Row>
          <label className="action-field">
            <span className="field-title" style={{ color: currentTheme === "light" ? "#222222" : "#ddd" }}>
              Contract period
            </span>
            <RangePicker
              defaultValue={[moment(startDate * 1000), moment(startDate * 1000 + secondsAfter * 1000)]}
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
                setShare(value);
              }}
              defaultValue={share}
              min={0}
              max={100}
              placeholder="Between 0 and 100"
              style={{ width: "100%" }}
            />
          </label>
        </Row>

        <Row>
          <label className="action-field">
            <span className="field-title" style={{ color: currentTheme === "light" ? "#222222" : "#ddd" }}>
              Initial deposit
            </span>
            <InputNumber
              onChange={value => {
                setInitialDeposit(value);
              }}
              defaultValue={initialDeposit}
              placeholder="Minimum ETH the payer has to deposit"
              style={{ width: "100%" }}
            />
          </label>
        </Row>
      </Col>
    </Modal>
  );
};

export default function PostDetail({ post }) {
  const remoteStorage = useRemoteStorage();
  const { user: me } = useAuthentication();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { currentTheme } = useThemeSwitcher();

  const { title, description, createdAt, share, threshold, author } = post;

  const showModal = () => {
    setIsModalVisible(true);
  };

  const putOffer = async props => {
    const result = await remoteStorage.putOffer(props);
    console.log(`Result: ${JSON.stringify(result)}`);
    setIsModalVisible(false);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <Col span={24}>
      <h1>{title}</h1>
      {/* <h4>
        From {author.username}
        {createdAt && <ReactTimeAgo date={new Date(createdAt)} locale="en-US" />}
      </h4> */}
      <Card size="small">
        <Meta
          avatar={
            <Avatar
              className={`icon ${currentTheme}`}
              size={38}
              alt={author.username}
              src={author.profilePicture || <Blockies size={38} seed={author.ethAddress.toLowerCase()} />}
            ></Avatar>
          }
          title={author.username}
          description={createdAt && <ReactTimeAgo date={new Date(createdAt)} locale="en-US" />}
        />
      </Card>
      <Row>
        <p style={{ fontSize: "1.4rem", marginTop: "32px", marginBottom: "32px" }}>
          <Description text={description} />
        </p>
      </Row>
      <Descriptions title="Conditions" bordered column={1}>
        <Descriptions.Item label="Provider's share">{`${share}%`}</Descriptions.Item>
        <Descriptions.Item label="Threshold gains (ETH)">{threshold}</Descriptions.Item>
      </Descriptions>
      {author.objectId !== me.id && (
        <Row style={{ marginTop: "32px" }}>
          <Button onClick={showModal}>Make an offer</Button>
          <Link to={`/chat/${author.objectId}`}>
            <Button>Send a message</Button>
          </Link>
        </Row>
      )}

      <OfferModal
        currentTheme={currentTheme}
        visible={isModalVisible}
        onOk={putOffer}
        onCancel={closeModal}
        initialValues={{ share, threshold }}
      />
    </Col>
  );
}
