import { List, Button, Col, Modal, Row, DatePicker, InputNumber, Card, Avatar, Descriptions } from "antd";
import React, { useMemo, useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { useBlockchain, useRemoteStorage } from "../providers";
import { useThemeSwitcher } from "react-css-theme-switcher";
import Blockies from "react-blockies";
import { PostEdit } from "./index";
import moment from "moment";

const { Meta } = Card;
const { RangePicker } = DatePicker;

const ContractModal = ({ currentTheme, visible, offer, onOk, onCancel }) => {
  const [share, setShare] = useState(offer.share);
  const [startDate, setStartDate] = useState(offer.startDate);
  const [secondsAfter, setSecondsAfter] = useState(offer.secondsAfter);
  const [initialDeposit, setInitialDeposit] = useState(offer.initialDeposit);

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
              // eslint-disable-next-line no-undef
              // defaultValue={[moment(startDate), moment(startDate + secondsAfter)]}
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
              Contractor&apos;s share
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
              defaultValue={share}
              placeholder="Minimum ETH the payer has to deposit"
              style={{ width: "100%" }}
            />
          </label>
        </Row>
      </Col>
    </Modal>
  );
};

export default function PostPrivate({ post }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [offers, setOffers] = useState([]);
  const remoteStorage = useRemoteStorage();
  const blockchain = useBlockchain();
  const { currentTheme } = useThemeSwitcher();

  const { title, description, createdAt, author } = post;
  const [currentOffer, setCurrentOffer] = useState();

  useMemo(async () => {
    if (post.objectId) {
      const offers = await remoteStorage.getOffers({ postId: post.objectId });
      setOffers(JSON.parse(JSON.stringify(offers)));
    }
  }, [post]);

  const createContract = async ({ threshold, startDate, secondsAfter, share }) => {
    const result = await blockchain.createPromotion({
      ownerAddress: author.ethAddress,
      mentorAddress: currentOffer.author.ethAddress,
      thresholdEth: threshold,
      startDate,
      secondsAfter,
      mentorCutAsPercentage: share,
    });
    console.log(`Result: ${JSON.stringify(result)}`);
    setIsModalVisible(false);
  };

  const closeModal = () => {
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
      <PostEdit initialValues={post} />
      <List>
        {offers.map((offer, key) => {
          const { author: contractor, description, share, deposit, startDate, secondsAfter } = offer;
          return (
            <List.Item
              key={key}
              actions={[
                <Button
                  key={0}
                  onClick={() => {
                    setCurrentOffer(offer);
                    setIsModalVisible(true);
                  }}
                >
                  Compose the contract
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={32}
                    alt={contractor.username}
                    src={contractor.profilePicture || <Blockies seed={contractor.ethAddress.toLowerCase()} />}
                  ></Avatar>
                }
                description={description}
              />
              <Descriptions title="Conditions" bordered column={{ sm: 2 }}>
                {share && <Descriptions.Item label="Share">{share}%</Descriptions.Item>}
                {deposit && <Descriptions.Item label="Initial deposit">{deposit}</Descriptions.Item>}
                {startDate && secondsAfter && (
                  <Descriptions.Item label="Period when the contract will be active">
                    {/* eslint-disable-next-line no-undef */}
                    {/* <RangePicker defaultValue={[moment(startDate), moment(startDate + secondsAfter)]} /> */}
                    <RangePicker
                      defaultValue={[moment(startDate * 1000), moment(startDate * 1000 + secondsAfter * 1000)]}
                    />
                  </Descriptions.Item>
                )}
              </Descriptions>
            </List.Item>
          );
        })}
      </List>

      {currentOffer && (
        <ContractModal
          currentTheme={currentTheme}
          offer={currentOffer}
          visible={isModalVisible}
          onOk={createContract}
          onCancel={closeModal}
        />
      )}
    </Col>
  );
}
