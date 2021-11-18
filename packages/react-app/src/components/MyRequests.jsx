import { List, Button, Descriptions, Modal, Row, DatePicker, InputNumber, Avatar, Space, message } from "antd";
import React, { useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { useBlockchain, useRemoteStorage } from "../providers";
import { useThemeSwitcher } from "react-css-theme-switcher";
import Blockies from "react-blockies";
import { OfferList, PostEditorModal, Description, Conditions } from "./index";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import moment from "moment";

const ContractModal = ({ title, visible, post, offer, onOk, onCancel }) => {
  const { ytChannelId } = post;
  return (
    <Modal title={title} visible={visible} onOk={onOk} onCancel={onCancel}>
      {/* <Descriptions title={null} bordered layout="vertical" column={1}>
        {initialDeposit && <Descriptions.Item label="Initial deposit">{initialDeposit} ETH</Descriptions.Item>}
        {thresholdETH && <Descriptions.Item label="Threshold ETH">{thresholdETH} ETH</Descriptions.Item>}
        {share && <Descriptions.Item label="Share">{share}%</Descriptions.Item>}
        {startDate && endDate && (
          <Descriptions.Item label="Period">
            <RangePicker defaultValue={[moment(startDate), moment(endDate)]} disabled />
          </Descriptions.Item>
        )}
        {ytChannelId && (
          <Descriptions.Item label="Youtube Channel Id">
            {ytChannelId} (<a href={`https://www.youtube.com/channel/${ytChannelId}`}>Link to the channel</a>)
          </Descriptions.Item>
        )}
        {ytMinViewCount && <Descriptions.Item label="Youtube Min Views">{ytMinViewCount} views</Descriptions.Item>}
        {ytMinSubscriberCount && (
          <Descriptions.Item label="Youtube Min Subscribers">{ytMinSubscriberCount} subscribers</Descriptions.Item>
        )}
      </Descriptions> */}
      <Conditions title={null} layout="vertical" conditions={{ ...offer, ytChannelId }} />
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
      <OfferList offers={post.offers} post={post} onComposeContract={onComposeContract} />
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

  const createContract = async (
    { ytChannelId = "" },
    { initialDeposit, thresholdETH, startDate, endDate, share, ytMinViewCount = 0, ytMinSubscriberCount = 0 },
  ) => {
    const conditions = {
      owner: currentPost.author.ethAddress,
      provider: currentOffer.author.ethAddress,
      initialDeposit,
      thresholdETH,
      startDate,
      endDate,
      share,
      ytChannelId: ytChannelId || "",
      ytMinViewCount: ytMinViewCount || "0",
      ytMinSubscriberCount: ytMinSubscriberCount || "0",
    };
    console.log(`Create contract with conditions: ${JSON.stringify(conditions)}`);
    const contractAddress = await blockchain.createContract(conditions);
    console.log(`New contract address: ${JSON.stringify(contractAddress)}`);
    const metadataResult = await remoteStorage.putContract({
      contractAddress,
      ownerId: currentPost.author.objectId,
      providerId: currentOffer.author.objectId,
      conditions,
    });
    console.log(`Metadata creation result: ${JSON.stringify(metadataResult)}`);
    await remoteStorage.setOfferStatus(currentOffer.objectId, "accepted");
    setIsContractModalVisible(false);
  };

  const closeContractModal = () => {
    setCurrentPost();
    setCurrentOffer();
    setIsContractModalVisible(false);
  };

  const onComposeContract = (post, offer) => {
    console.log(`Compose contract with offer ${JSON.stringify(offer)}`);
    setCurrentOffer(offer);
    setCurrentPost(post);
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
          initialValues={{
            ...currentPost,
            period: [moment(currentPost.startDate * 1000), moment(currentPost.endDate * 1000)],
          }}
          onCancel={() => {
            setIsEditModalVisible(false);
            setCurrentPost();
          }}
          onOk={async props => {
            await remoteStorage.putPost({ ...props, objectId: currentPost.objectId });
            setIsEditModalVisible(false);
            message.success("Post updated correctly!");
          }}
        />
      )}

      {currentPost && currentOffer && (
        <ContractModal
          title="Contract conditions"
          post={currentPost}
          offer={currentOffer}
          visible={isContractModalVisible}
          onOk={() => createContract(currentPost, currentOffer)}
          onCancel={closeContractModal}
        />
      )}
      {/* {currentPost && currentOffer && (
        <ContractModal
          title="Make an offer"
          offer={currentOffer}
          visible={isContractModalVisible}
          onOk={createContract(currentPost)}
          onCancel={closeModal}
        />
      )} */}
    </>
  );
}
