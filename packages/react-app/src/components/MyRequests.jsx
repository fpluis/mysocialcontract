import { List, Button, Col, Modal, Row, DatePicker, InputNumber, Avatar, Space } from "antd";
import React, { useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { useBlockchain, useRemoteStorage } from "../providers";
import { useThemeSwitcher } from "react-css-theme-switcher";
import Blockies from "react-blockies";
import { OfferList, PostEditorModal } from "./index";
import moment from "moment";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import Description from "./Description";

const { RangePicker } = DatePicker;

const ContractModal = ({ visible, offer, onOk, onCancel }) => {
  const { currentTheme } = useThemeSwitcher();
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

const renderItem = ({ post, currentTheme, onEdit, onDelete, onComposeContract }) => {
  console.log(`Render post ${JSON.stringify(post)}`);
  const { title, description, createdAt, author } = post;

  return (
    <List.Item
      key={title}
      extra={
        <Space>
          <Button key="edit" icon={<EditOutlined />} onClick={() => onEdit(post)} />
          <Button key="reject" icon={<CloseOutlined />} onClick={() => onDelete(post)} />
        </Space>
      }
    >
      <List.Item.Meta
        avatar={
          <Avatar
            className={`icon ${currentTheme}`}
            size={38}
            alt={author.username}
            src={author.profilePicture || <Blockies size={38} seed={author.ethAddress.toLowerCase()} />}
          ></Avatar>
        }
        title={title}
        description={createdAt && <ReactTimeAgo date={new Date(createdAt)} locale="en-US" />}
      />
      <Description text={description} />
      <OfferList offers={post.offers} onComposeContract={onComposeContract} />
    </List.Item>
  );
};

export default function MyRequests({ posts }) {
  console.log(`Displaying posts ${JSON.stringify(posts)}`);
  const [isContractModalVisible, setIsContractModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentOffer, setCurrentOffer] = useState();
  const [currentPost, setCurrentPost] = useState();
  const blockchain = useBlockchain();
  const remoteStorage = useRemoteStorage();
  const { currentTheme } = useThemeSwitcher();

  const createContract = async ({ threshold, startDate, secondsAfter, share }) => {
    const result = await blockchain.createPromotion({
      ownerAddress: currentPost.author.ethAddress,
      mentorAddress: currentOffer.author.ethAddress,
      thresholdEth: threshold,
      startDate,
      secondsAfter,
      mentorCutAsPercentage: share,
    });
    console.log(`Result: ${JSON.stringify(result)}`);
    setIsContractModalVisible(false);
  };

  const closeModal = () => {
    setIsContractModalVisible(false);
  };

  const onComposeContract = offer => {
    setCurrentOffer(offer);
    setIsContractModalVisible(true);
  };

  const onEdit = post => {
    setCurrentPost(post);
    setIsEditModalVisible(true);
  };

  const onDelete = post => {
    return remoteStorage.removePost(post);
  };

  return (
    <>
      <List
        itemLayout="vertical"
        size="default"
        dataSource={posts}
        renderItem={post => renderItem({ post, currentTheme, onEdit, onDelete, onComposeContract })}
      />

      {currentPost && (
        <PostEditorModal
          visible={isEditModalVisible}
          title="Edit this post"
          initialValues={currentPost}
          onCancel={() => {
            setIsEditModalVisible(false);
          }}
          onFinish={async props => {
            await remoteStorage.putPost(props);
            setIsEditModalVisible(false);
          }}
        />
      )}

      {currentOffer && (
        <ContractModal
          offer={currentOffer}
          visible={isContractModalVisible}
          onOk={createContract}
          onCancel={closeModal}
        />
      )}
    </>
  );
}
