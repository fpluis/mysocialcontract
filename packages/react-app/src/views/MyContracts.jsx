import { ClockCircleOutlined, TwitterOutlined, YoutubeOutlined } from "@ant-design/icons";
import { List, Button, Col, Row, Descriptions, Progress, Divider, Statistic, Spin, Modal, Result, Card } from "antd";
import React, { useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { ProfileBadge } from "../components";
import { useAuthentication, useBlockchain, useMyContracts } from "../providers";
import moment from "moment";

const ONE_DAY_IN_SECONDS = 24 * 60 * 60;

const renderContract = ({ contract, key, myEthAddress, withdraw, openConditionsModal }) => {
  const {
    owner,
    provider,
    createdAt,
    contractAddress,
    isOwnerPaid,
    isProviderPaid,
    isSuccessful,
    balance,
    balanceAtEnd,
    thresholdETH,
    // ytViews,
    // ytSubs,
    // twitterFollowers,
    liveYtViewCount,
    liveYtSubCount,
    ytMinViewCount,
    ytMinSubscriberCount,
    twitterMinFollowers,
    liveTwitterFollowers,
    ytChannelId,
    twitterUsername,
    initialDeposit,
    share,
  } = contract;

  const deadlineInSeconds = contract.endDate;
  const nowInSeconds = new Date().getTime() / 1000;
  const gracePeriodEnd = deadlineInSeconds + ONE_DAY_IN_SECONDS;
  const balanceETH = balanceAtEnd === 0 ? balance / 1000000000000000000 : balanceAtEnd;
  const balancePercent = thresholdETH === 0 || isSuccessful ? 100 : Math.min((balanceETH / thresholdETH) * 100, 100);
  const ytLiveViewsPercent = ytMinViewCount === 0 ? 100 : Math.min((liveYtViewCount / ytMinViewCount) * 100, 100);
  const ytLiveSubPercent =
    ytMinSubscriberCount === 0 ? 100 : Math.min((liveYtSubCount / ytMinSubscriberCount) * 100, 100);
  const twitterLiveFollowersPercent =
    twitterMinFollowers === 0 ? 100 : Math.min((liveTwitterFollowers / twitterMinFollowers) * 100, 100);

  const status = isSuccessful
    ? "successful"
    : deadlineInSeconds > nowInSeconds
    ? "active"
    : gracePeriodEnd > nowInSeconds
    ? "finished"
    : "failed";
  const statusMessage =
    status === "successful" ? (
      <span style={{ color: "#2e7d32" }}>Successful</span>
    ) : status === "active" ? (
      <span style={{ color: "#4caf50" }}>In progress</span>
    ) : status === "finished" ? (
      <span>Finished</span>
    ) : (
      <span style={{ color: "#c62828" }}>Failed</span>
    );
  const canWithdraw =
    (myEthAddress.toLowerCase() === provider.ethAddress.toLowerCase() && !isProviderPaid && status === "successful") ||
    (myEthAddress.toLowerCase() === owner.ethAddress.toLowerCase() &&
      !isOwnerPaid &&
      ["failed", "successful"].includes(status));

  const conditionsFulfilled =
    balance >= thresholdETH &&
    (ytMinViewCount === 0 || liveYtViewCount > ytMinViewCount) &&
    (ytMinSubscriberCount === 0 || liveYtSubCount > ytMinSubscriberCount) &&
    (twitterMinFollowers === 0 || liveTwitterFollowers > twitterMinFollowers);

  return (
    <List.Item key={key} style={{ marginTop: "32px" }}>
      <List.Item.Meta
        avatar={<ProfileBadge {...owner} />}
        title={
          <Col span={24}>
            <Row>
              <Col span={6}>
                <h4 style={{ fontSize: "1.4rem" }}>{owner.username}</h4>
              </Col>
              <Col span={18}>
                <Button style={{ float: "right" }}>
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href={`https://kovan.etherscan.io/address/${contractAddress}`}
                  >
                    View on Etherscan
                  </a>
                </Button>
                {conditionsFulfilled && !isSuccessful && (
                  <Button
                    disabled={isSuccessful}
                    style={{ float: "right" }}
                    onClick={async () => {
                      openConditionsModal(contract);
                    }}
                  >
                    Sync contract
                  </Button>
                )}
                {canWithdraw && (
                  <Button
                    style={{ marginRight: "8px", float: "right" }}
                    onClick={async () => {
                      await withdraw(contract);
                      // console.log(`Withdraw result: ${JSON.stringify(result)},`, result);
                    }}
                  >
                    Withdraw funds
                  </Button>
                )}
              </Col>
            </Row>
          </Col>
        }
        description={
          <Col span={24} style={{ fontSize: "1rem" }}>
            <Row>
              <h4>Status: {statusMessage}</h4>
            </Row>
            {createdAt && (
              <Row>
                <p>
                  Started <ReactTimeAgo date={new Date(createdAt)} locale="en-US" />
                </p>
              </Row>
            )}
          </Col>
        }
      />

      <Card title={null} className="contract-progress">
        {ytChannelId && liveYtViewCount && (
          <Card.Grid>
            <a rel="noopener noreferrer" target="_blank" href={`https://www.youtube.com/channel/${ytChannelId}`}>
              <h4>
                <YoutubeOutlined style={{ color: "#e52d27" }} /> Views
              </h4>
              <Divider type="horizontal" />
              <p>
                {Number(liveYtViewCount).toLocaleString()} / {Number(ytMinViewCount).toLocaleString()}
              </p>
              <p>
                <Progress percent={ytLiveViewsPercent}></Progress>
              </p>
            </a>
          </Card.Grid>
        )}
        {ytChannelId && liveYtSubCount && (
          <Card.Grid>
            <a rel="noopener noreferrer" target="_blank" href={`https://www.youtube.com/channel/${ytChannelId}`}>
              <h4>
                <YoutubeOutlined style={{ color: "#e52d27" }} /> Subscribers
              </h4>
              <Divider type="horizontal" />
              <p>
                {Number(liveYtSubCount).toLocaleString()} / {Number(ytMinSubscriberCount).toLocaleString()}
              </p>
              <p>
                <Progress percent={ytLiveSubPercent}></Progress>
              </p>
            </a>
          </Card.Grid>
        )}
        {liveTwitterFollowers && twitterUsername && (
          <Card.Grid>
            <a rel="noopener noreferrer" target="_blank" href={`https://twitter.com/${twitterUsername}`}>
              <h4>
                <TwitterOutlined style={{ color: "#1DA1F2" }} /> Followers
              </h4>
              <Divider type="horizontal" />
              <p>
                {Number(liveTwitterFollowers).toLocaleString()} / {Number(twitterMinFollowers).toLocaleString()}
              </p>
              <p>
                <Progress percent={twitterLiveFollowersPercent}></Progress>
              </p>
            </a>
          </Card.Grid>
        )}
        <Card.Grid>
          <h4>
            <ClockCircleOutlined /> Deadline
          </h4>
          <Divider type="horizontal" />
          <p>{new Date(contract.endDate * 1000).toLocaleString()}</p>
          <p>({moment(new Date(contract.endDate * 1000)).from(new Date())})</p>
        </Card.Grid>
        {thresholdETH > 0 && (
          <Card.Grid>
            <h4>
              <img src="/eth.png" /> Balance
            </h4>
            <Divider type="horizontal" />
            <p>
              {balanceETH.toFixed(4)} / {thresholdETH.toFixed(4)}
            </p>
            <p>
              <Progress percent={balancePercent}></Progress>
            </p>
          </Card.Grid>
        )}
        <Card.Grid>
          <h4>
            <img src="/eth.png" /> Payment
          </h4>
          <Divider type="horizontal" />
          <p>
            Initial deposit: <b>{Number(initialDeposit).toFixed(4)}</b>
          </p>
          <p>
            Provider&apos;s share: <b>{share}%</b>
          </p>
        </Card.Grid>
      </Card>
      <Divider type="horizontal" style={{ marginBottom: "16px" }} />
    </List.Item>
  );
};

const ConditionsModal = ({ visible, title, onOk, onCancel, needsLink, isSuccessful }) => {
  const [isCheckingConditions, setIsCheckingConditions] = useState(false);
  return (
    <Modal visible={visible} title={title} footer={null} onCancel={onCancel}>
      {isSuccessful ? (
        <Result
          status="success"
          title="Your contract was successful! Both parties can now withdraw their share"
          extra={[
            <Button type="primary" key="close" onClick={onCancel}>
              Go Back to your contracts
            </Button>,
          ]}
        />
      ) : isCheckingConditions ? (
        <div style={{ width: "100%", textAlign: "center" }}>
          <h1>Checking conditions... Hang tight, this might take a while.</h1>
          <Spin style={{ width: "100%" }} size="large" />
        </div>
      ) : (
        <Result
          title={
            needsLink
              ? "Now that all the conditions are met, it's time to synchronize the contract so you can withdraw your share. Make sure you have at least 0.1 LINK and some ETH to pay for the transaction"
              : "Now that all the conditions are met, it's time to synchronize the contract so you can withdraw your share. Make sure you have some ETH to pay for the transaction"
          }
          extra={
            <Button
              type="primary"
              key="console"
              onClick={async () => {
                setIsCheckingConditions(true);
                return onOk();
              }}
            >
              Check conditions
            </Button>
          }
        />
      )}
    </Modal>
  );
};

export default function ContractList() {
  const {
    profile: { userId: myUserId, ethAddress: myEthAddress },
  } = useAuthentication();
  const blockchain = useBlockchain();
  const { contracts, event, hasLoaded } = useMyContracts();
  const [isResultsModalVisible, setIsResultsModalVisible] = useState(false);
  const [currentContract, setCurrentContract] = useState();

  const withdraw = contract => blockchain.withdraw(contract.contractAddress);

  const checkConditions = contract => blockchain.checkConditions(contract);

  const openConditionsModal = contract => {
    setCurrentContract(contract);
    setIsResultsModalVisible(true);
  };

  const listProps = {
    itemLayout: "vertical",
    size: "small",
    style: { border: "1px solid rgba(0, 0, 0, 0.06)", marginTop: "16px" },
    className: "contract-list",
  };

  const needsLink = contract => contract.ytChannelId !== "-" || contract.twitterUsername !== "-";

  const contractsIOwn = contracts.filter(contract => contract.ownerId === myUserId);
  const contractsIProvide = contracts.filter(contract => contract.providerId === myUserId);

  console.log(`Received event ${JSON.stringify(event)}`);
  return (
    <>
      {!hasLoaded && <Spin size="large" style={{ width: "100%", marginTop: "64px" }} />}
      <h1 style={{ fontSize: "2.4rem", width: "100%" }}>Contracts I created</h1>
      <Divider type="horizontal" style={{ marginBottom: "16px" }} />
      <List
        {...listProps}
        dataSource={contractsIOwn}
        renderItem={(contract, index) =>
          renderContract({
            contract,
            key: index,
            myEthAddress,
            withdraw,
            openConditionsModal,
          })
        }
      />
      <Divider type="horizontal" />
      <h1 style={{ fontSize: "2.4rem", width: "100%" }}>Contracts where I provide</h1>
      <Divider type="horizontal" style={{ marginBottom: "16px" }} />
      <List
        {...listProps}
        dataSource={contractsIProvide}
        renderItem={(contract, index) =>
          renderContract({
            contract,
            key: index,
            myEthAddress,
            withdraw,
            openConditionsModal,
          })
        }
      />
      <ConditionsModal
        visible={isResultsModalVisible}
        title="Check the contract's conditions"
        isSuccessful={
          event && currentContract && event.event === "OnSuccess" && event.address === currentContract.contractAddress
        }
        needsLink={currentContract != null && needsLink(currentContract)}
        onCancel={() => {
          setIsResultsModalVisible(false);
          setCurrentContract(null);
        }}
        onOk={() => checkConditions(currentContract)}
      ></ConditionsModal>
    </>
  );
}
