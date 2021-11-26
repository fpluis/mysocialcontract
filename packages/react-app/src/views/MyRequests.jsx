import { List, Button, Col, Modal, Row, Space, message } from "antd";
import React, { useMemo, useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { useAuthentication, useBlockchain, useRemoteStorage } from "../providers";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { OfferList, PostEditorModal, Description, Conditions, ProfileBadge } from "../components/index";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import moment from "moment";

const ContractModal = ({ title, visible, post, offer, onOk, onCancel }) => {
  const { ytChannelId, twitterUsername } = post;
  return (
    <Modal title={title} visible={visible} onOk={onOk} onCancel={onCancel}>
      <Conditions title={null} layout="horizontal" conditions={{ ...offer, twitterUsername, ytChannelId }} />
    </Modal>
  );
};

const renderItem = ({ post, currentTheme, onEdit, onDelete, onComposeContract, onRejectOffer }) => {
  const { objectId, title, description, createdAt, author, offers = [], status } = post;
  const offersToShow = offers.filter(({ status }) => status !== "rejected");
  const statusMessage =
    status === "active" ? <span>Accepting offers</span> : <span style={{ color: "#388e3c" }}>Signed</span>;
  return (
    <List.Item
      key={objectId}
      extra={
        <Space>
          <Button key="edit" icon={<EditOutlined />} onClick={() => onEdit(post)} />
          <Button key="reject" icon={<CloseOutlined />} onClick={() => onDelete(post)} />
        </Space>
      }
    >
      <List.Item.Meta
        avatar={<ProfileBadge {...author} />}
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
  const blockchain = useBlockchain();
  const remoteStorage = useRemoteStorage();
  const { currentTheme } = useThemeSwitcher();
  const { user, profile: myProfile } = useAuthentication();
  const [requests, setRequests] = useState([]);

  useMemo(async () => {
    if (user.authenticated()) {
      const myPosts = await remoteStorage.getPosts({ status: "active", authorId: myProfile.userId });
      const offers = await remoteStorage.getOffers({ postIds: myPosts.map(({ objectId }) => objectId) });
      const withOffers = myPosts.map(post => {
        const { objectId: postId } = post;
        const postOffers = offers.filter(({ postId: offerPostId }) => offerPostId === postId);
        post.offers = postOffers;
        return post;
      });
      setRequests(withOffers);
    }
  }, [user, myProfile]);

  const [isContractModalVisible, setIsContractModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentOffer, setCurrentOffer] = useState();
  const [currentPost, setCurrentPost] = useState();

  const createContract = async (post, offer) => {
    const { ytChannelId, twitterUsername } = post;
    const { initialDeposit, thresholdETH, endDate, share, ytMinViewCount, ytMinSubscriberCount, twitterMinFollowers } =
      offer;
    const conditions = {
      owner: post.author.ethAddress,
      provider: offer.author.ethAddress,
      initialDeposit,
      thresholdETH,
      endDate,
      share,
      ytChannelId,
      ytMinViewCount,
      ytMinSubscriberCount,
      twitterUsername,
      twitterMinFollowers,
    };
    const contractAddress = await blockchain.createContract(conditions);
    return Promise.all([
      remoteStorage.putContract({
        contractAddress,
        ownerId: post.author.userId,
        providerId: offer.author.userId,
        ytChannelId,
        twitterUsername,
      }),
      remoteStorage.setPostStatus(post.objectId, "signed"),
      remoteStorage.setOfferStatus(offer.objectId, "accepted"),
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
            endDate: moment(currentPost.endDate * 1000),
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
