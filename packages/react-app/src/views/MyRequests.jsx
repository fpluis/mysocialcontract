import { List, Button, Col, Modal, Row, Avatar, Space, message } from "antd";
import React, { useMemo, useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { useAuthentication, useBlockchain, useRemoteStorage } from "../providers";
import { useThemeSwitcher } from "react-css-theme-switcher";
import Blockies from "react-blockies";
import { OfferList, PostEditorModal, Description, Conditions } from "../components/index";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import moment from "moment";

const ContractModal = ({ title, visible, post, offer, onOk, onCancel }) => {
  const { ytChannelId } = post;
  return (
    <Modal title={title} visible={visible} onOk={onOk} onCancel={onCancel}>
      <Conditions title={null} layout="horizontal" conditions={{ ...offer, ytChannelId }} />
    </Modal>
  );
};

const renderItem = ({ post, currentTheme, onEdit, onDelete, onComposeContract, onRejectOffer }) => {
  console.log(`Render post ${JSON.stringify(post)}`);
  const { title, description, createdAt, author, offers = [], status } = post;
  const offersToShow = offers.filter(({ status }) => status !== "rejected");
  const statusMessage =
    status === "active" ? <span>Accepting offers</span> : <span style={{ color: "#388e3c" }}>Signed</span>;
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
        description={
          <Col span={24}>
            <Row>
              <h4 style={{ fontWeight: "bold" }}>{statusMessage}</h4>
            </Row>
            {createdAt && (
              <Row>
                <ReactTimeAgo date={new Date(createdAt)} locale="en-US" />
              </Row>
            )}
          </Col>
        }
      />
      <Description text={description} />
      <Conditions title={null} layout="horizontal" conditions={post} />
      <OfferList
        offers={offersToShow}
        post={post}
        onComposeContract={onComposeContract}
        onRejectOffer={onRejectOffer}
      />
    </List.Item>
  );
};

export default function MyRequests() {
  console.log(`Render my requests`);
  const blockchain = useBlockchain();
  const remoteStorage = useRemoteStorage();
  const { currentTheme } = useThemeSwitcher();
  const { user, profile: myProfile } = useAuthentication();
  const [requests, setRequests] = useState([]);

  useMemo(async () => {
    if (user.authenticated()) {
      const myPosts = await remoteStorage.getPosts({ status: "active", authorId: myProfile.userId });
      const offers = await remoteStorage.getOffers({ postIds: myPosts.map(({ objectId }) => objectId) });
      console.log(`All offers found for posts ${JSON.stringify(myPosts)}: ${JSON.stringify(offers)}`);
      const withOffers = myPosts.map(post => {
        const { objectId: postId } = post;
        const postOffers = offers.filter(({ postId: offerPostId }) => offerPostId === postId);
        console.log(`Post offers: ${JSON.stringify(postOffers)}`);
        post.offers = postOffers;
        return post;
      });
      setRequests(withOffers);
      console.log(`Updated requests: ${JSON.stringify(withOffers)}`);
    }
  }, [user, myProfile]);

  const [isContractModalVisible, setIsContractModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentOffer, setCurrentOffer] = useState();
  const [currentPost, setCurrentPost] = useState();

  const createContract = async (post, offer) => {
    const { ytChannelId } = post;
    const { initialDeposit, thresholdETH, startDate, endDate, share, ytMinViewCount, ytMinSubscriberCount } = offer;
    const conditions = {
      owner: currentPost.author.ethAddress,
      provider: currentOffer.author.ethAddress,
      initialDeposit,
      thresholdETH,
      startDate,
      endDate,
      share,
      ytChannelId,
      ytMinViewCount,
      ytMinSubscriberCount,
    };
    console.log(`Create contract with conditions: ${JSON.stringify(conditions)}`);
    const contractAddress = await blockchain.createContract(conditions);
    console.log(`New contract address: ${JSON.stringify(contractAddress)}`);
    return Promise.all([
      remoteStorage.putContract({
        contractAddress,
        ownerId: currentPost.author.userId,
        providerId: currentOffer.author.userId,
      }),
      remoteStorage.setPostStatus(post.objectId, "signed"),
      remoteStorage.setOfferStatus(currentOffer.objectId, "accepted"),
    ]).then(() => {
      offer.status = "accepted";
      post.status = "signed";
      const updatedPosts = requests.map(({ objectId, ...props }) => {
        if (objectId === post.objectId) {
          return { ...props, objectId, status: "signed" };
        }

        return { ...props, objectId };
      });
      setRequests(updatedPosts);
      setIsContractModalVisible(false);
    });
  };

  const closeContractModal = () => {
    setCurrentPost();
    setCurrentOffer();
    setIsContractModalVisible(false);
  };

  const onComposeContract = (offer, post) => {
    console.log(`Compose contract with offer ${JSON.stringify(offer)}; post ${JSON.stringify(post)}`);
    setCurrentOffer(offer);
    setCurrentPost(post);
    setIsContractModalVisible(true);
  };

  const onEdit = post => {
    setCurrentPost(post);
    setIsEditModalVisible(true);
  };

  const onRejectOffer = (offer, post) => {
    const updatedPosts = requests.map(({ objectId, offers, ...props }) => {
      const updatedOffers = offers.filter(({ objectId: offerId }) => offerId !== offer.objectId);
      console.log(`Updated offers after rejecting ${offer.objectId}: ${JSON.stringify(offers)}`);
      if (objectId === post.objectId) {
        return { ...props, objectId, offers: updatedOffers };
      }

      return { ...props, objectId };
    });
    setRequests(updatedPosts);
    remoteStorage.setOfferStatus(offer.objectId, "rejected");
  };

  const onDelete = post => {
    return remoteStorage.removePost(post);
  };

  return (
    <>
      <List
        itemLayout="vertical"
        size="default"
        dataSource={requests}
        renderItem={post => renderItem({ post, currentTheme, onEdit, onDelete, onComposeContract, onRejectOffer })}
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
    </>
  );
}
