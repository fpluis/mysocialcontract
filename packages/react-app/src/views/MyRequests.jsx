import { List, Button, Col, Modal, Row, Space, message, Divider, Tooltip, Table } from "antd";
import React, { useMemo, useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { useAuthentication, useBlockchain, useRemoteStorage } from "../providers";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { PostEditorModal, Description, Conditions, ProfileBadge } from "../components/index";
import { CloseOutlined, EditOutlined, FormOutlined, MessageOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import moment from "moment";
import "./MyRequests.css";

const ContractModal = ({ title, visible, post, offer, onOk, onCancel }) => {
  const { ytChannelId, twitterUsername } = post;
  return (
    <Modal title={title} visible={visible} onOk={onOk} onCancel={onCancel}>
      <Conditions title={null} column={1} layout="horizontal" conditions={{ ...offer, twitterUsername, ytChannelId }} />
    </Modal>
  );
};

const renderOffer = ({ offer, post, key, onRejectOffer, onComposeContract, showPostLink }) => {
  const {
    author: provider,
    createdAt,
    status,
    initialDeposit: offerInitialDeposit,
    share: offerShare,
    thresholdETH: offerThresholdETH = 0,
    endDate: offerEndDate,
    ytMinViewCount: offerYtMinViewCount = 0,
    ytMinSubscriberCount: offerYtMinSubscriberCount = 0,
    twitterMinFollowers: offerTwitterMinFollowers = 0,
  } = offer;
  const {
    initialDeposit,
    share,
    thresholdETH = 0,
    endDate,
    ytMinViewCount = 0,
    ytMinSubscriberCount = 0,
    twitterMinFollowers = 0,
  } = post;
  const statusMessage = status === "active" ? <span>Pending</span> : <span style={{ color: "#388e3c" }}>Accepted</span>;
  const actions = [
    <Tooltip key="compose" position="top" text="Compose the contract">
      <Button
        icon={<FormOutlined />}
        onClick={() => {
          console.log(`Compose contract with post ${JSON.stringify(post)}`);
          onComposeContract(offer, post);
        }}
      />
    </Tooltip>,
    <Tooltip key="reject" position="top" text="Message the user">
      <Link to={`/chat/${provider.userId}`}>
        <Button icon={<MessageOutlined />}></Button>
      </Link>
    </Tooltip>,
    <Tooltip key="reject" position="top" text="Reject offer">
      <Button
        icon={<CloseOutlined />}
        onClick={() => {
          onRejectOffer(offer, post);
        }}
      />
    </Tooltip>,
  ];

  const offerTable = [];

  const initialDepositDiff = offerInitialDeposit - initialDeposit;
  if (initialDepositDiff !== 0) {
    offerTable.push({
      key: offerTable.length + 1,
      property: "Initial Deposit",
      impact: initialDepositDiff > 0 ? "-" : "+",
      requested: initialDeposit,
      offered: offerInitialDeposit,
      difference: initialDepositDiff.toFixed(4),
    });
  }

  const shareDiff = offerShare - share;
  if (shareDiff !== 0) {
    offerTable.push({
      key: offerTable.length + 1,
      property: "Provider Share",
      impact: shareDiff > 0 ? "-" : "+",
      requested: `${share}%`,
      offered: `${offerShare}%`,
      difference: `${shareDiff}%`,
    });
  }

  const thresholdETHDiff = offerThresholdETH - thresholdETH;
  if (thresholdETHDiff !== 0) {
    offerTable.push({
      key: offerTable.length + 1,
      property: "Threshold ETH",
      impact: thresholdETHDiff > 0 ? "-" : "+",
      requested: thresholdETH,
      offered: offerThresholdETH,
      difference: thresholdETHDiff,
    });
  }

  const endDateDiff = offerEndDate - endDate;
  const requestedDate = new Date(endDate * 1000);
  const offeredDate = new Date(offerEndDate * 1000);
  if (endDateDiff !== 0) {
    offerTable.push({
      key: offerTable.length + 1,
      property: "Deadline",
      impact: endDateDiff > 0 ? "+" : "-",
      requested: requestedDate.toLocaleDateString(),
      offered: offeredDate.toLocaleDateString(),
      difference: moment(requestedDate).to(offeredDate),
    });
  }

  const ytMinViewCountDiff = offerYtMinViewCount - ytMinViewCount;
  if (ytMinViewCountDiff !== 0) {
    offerTable.push({
      key: offerTable.length + 1,
      property: "Min. Youtube Views",
      impact: ytMinViewCountDiff > 0 ? "+" : "-",
      requested: ytMinViewCount,
      offered: offerYtMinViewCount,
      difference: ytMinViewCountDiff,
    });
  }

  const ytMinSubscriberCountDiff = offerYtMinSubscriberCount - ytMinSubscriberCount;
  if (ytMinSubscriberCountDiff !== 0) {
    offerTable.push({
      key: offerTable.length + 1,
      property: "Min. Youtube Subscribers",
      impact: ytMinSubscriberCountDiff > 0 ? "+" : "-",
      requested: ytMinSubscriberCount,
      offered: offerYtMinSubscriberCount,
      difference: ytMinSubscriberCountDiff,
    });
  }

  const twitterMinFollowersDiff = offerTwitterMinFollowers - twitterMinFollowers;
  if (twitterMinFollowersDiff !== 0) {
    offerTable.push({
      key: offerTable.length + 1,
      property: "Min. Twitter followers",
      impact: twitterMinFollowersDiff > 0 ? "+" : "-",
      requested: twitterMinFollowers,
      offered: offerTwitterMinFollowers,
      difference: twitterMinFollowersDiff,
    });
  }

  if (offerTable.length === 0) {
    offerTable.push({
      key: 1,
      property: "All conditions",
      impact: "=",
      requested: "Same",
      offered: "Same",
      difference: 0,
    });
  }

  const columns = [
    {
      title: "Impact",
      dataIndex: "impact",
      key: "impact",
    },
    {
      title: "Property",
      dataIndex: "property",
      key: "property",
    },
    {
      title: "Requested",
      dataIndex: "requested",
      key: "requested",
    },
    {
      title: "Offered",
      dataIndex: "offered",
      key: "offered",
    },
    {
      title: "Difference",
      dataIndex: "difference",
      key: "difference",
    },
  ];

  return (
    <List.Item key={key}>
      <List.Item.Meta
        avatar={<ProfileBadge {...provider} />}
        title={
          <Col span={24}>
            <Row>
              <Col span={post && post.status !== "signed" ? 12 : 24}>
                <h4>{provider.username}</h4>
              </Col>
              {post && post.status !== "signed" && (
                <Col span={12}>
                  <Space style={{ float: "right" }}>{actions}</Space>
                </Col>
              )}
            </Row>
          </Col>
        }
        description={
          <Col span={24}>
            <Row>
              <h4 style={{ fontWeight: "bold" }}>Status: {statusMessage}</h4>
            </Row>
            {createdAt && (
              <Row>
                <ReactTimeAgo date={new Date(createdAt)} locale="en-US" />
              </Row>
            )}
          </Col>
        }
        locale="en-US"
      />
      <Table
        dataSource={offerTable}
        rowClassName={({ impact }) => (impact === "+" ? "positive" : impact === "-" ? "negative" : "equal")}
        columns={columns}
        pagination={false}
        style={{ marginBottom: "32px" }}
      />
    </List.Item>
  );
};

const OfferList = ({ offers, post, onRejectOffer, onComposeContract, showPostLink = true }) => {
  console.log(`Render offer list; post: ${JSON.stringify(post)}`);
  return (
    <List
      itemLayout="vertical"
      size="small"
      style={{ border: "1px solid rgba(0, 0, 0, 0.06)", marginTop: "16px" }}
      className="offer-list"
      dataSource={offers}
      renderItem={(offer, index) =>
        renderOffer({
          offer,
          post,
          key: index,
          onRejectOffer,
          onComposeContract,
          showPostLink,
        })
      }
    ></List>
  );
};

const renderRequest = ({ post, onEdit, onDelete, onComposeContract, onRejectOffer }) => {
  const { objectId, title, description, createdAt, author, offers = [], status } = post;
  const offersToShow = offers.filter(({ status }) => status !== "rejected");
  const statusMessage =
    status === "active" ? <span>Accepting offers</span> : <span style={{ color: "#388e3c" }}>Signed</span>;
  return (
    <List.Item key={objectId}>
      <List.Item.Meta
        avatar={<ProfileBadge {...author} />}
        title={
          <Row>
            <Col span={20}>
              <h4 style={{ fontSize: "1.2rem" }}>{title}</h4>
            </Col>
            <Col span={4}>
              <Space style={{ float: "right" }}>
                <Button key="edit" icon={<EditOutlined />} onClick={() => onEdit(post)} />
                <Button key="reject" icon={<CloseOutlined />} onClick={() => onDelete(post)} />
              </Space>
            </Col>
          </Row>
        }
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
      <Conditions title={null} column={2} layout="horizontal" conditions={post} />
      <Divider type="horizontal" />
      <div style={{ marginLeft: "64px" }}>
        <h2>Offers for this request</h2>
        <OfferList
          showPostLink={false}
          offers={offersToShow}
          post={post}
          onComposeContract={onComposeContract}
          onRejectOffer={onRejectOffer}
        />
      </div>
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
      <h1 style={{ fontSize: "2.4rem", width: "100%" }}>My Requests</h1>
      <Divider type="horizontal" style={{ marginBottom: "16px" }} />
      <List
        itemLayout="vertical"
        size="default"
        dataSource={requests}
        renderItem={post => renderRequest({ post, currentTheme, onEdit, onDelete, onComposeContract, onRejectOffer })}
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
