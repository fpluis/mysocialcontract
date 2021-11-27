import { List, Button, Col, Row, Descriptions, Progress, Divider, Statistic, Spin, Modal, Result } from "antd";
import React, { useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { Conditions, ProfileBadge } from "../components";
import { useAuthentication, useBlockchain, useMyContracts } from "../providers";

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
    thresholdETH,
    ytViews,
    ytSubs,
    liveYtViewCount,
    liveYtSubCount,
    ytMinViewCount,
    ytMinSubscriberCount,
    twitterFollowers,
    twitterMinFollowers,
    liveTwitterFollowers,
  } = contract;

  const deadlineInSeconds = contract.endDate;
  const nowInSeconds = new Date().getTime() / 1000;
  const gracePeriodEnd = deadlineInSeconds + ONE_DAY_IN_SECONDS;
  const balanceETH = balance / 1000000000000000000;
  const balancePercent = thresholdETH === 0 || isSuccessful ? 100 : Math.min((balance / thresholdETH) * 100, 100);
  const ytViewsPercent = ytMinViewCount === 0 ? 100 : Math.min((ytViews / ytMinViewCount) * 100, 100);
  const ytSubsPercent = ytMinSubscriberCount === 0 ? 100 : Math.min((ytSubs / ytMinSubscriberCount) * 100, 100);
  const twitterFollowersPercent =
    twitterMinFollowers === 0 ? 100 : Math.min((twitterFollowers / twitterMinFollowers) * 100, 100);
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
      <span style={{ color: "#388e3c" }}>Successful</span>
    ) : status === "active" ? (
      <span style={{ color: "#388e3c" }}>In progress</span>
    ) : status === "finished" ? (
      <span>Finished</span>
    ) : (
      <span style={{ color: "#b71c1c" }}>Failed</span>
    );
  const canWithdraw =
    (myEthAddress.toLowerCase() === provider.ethAddress.toLowerCase() && !isProviderPaid && status === "successful") ||
    (myEthAddress.toLowerCase() === owner.ethAddress.toLowerCase() &&
      !isOwnerPaid &&
      ["failed", "successful"].includes(status));

  return (
    <List.Item key={key} style={{ marginTop: "32px" }}>
      <List.Item.Meta
        avatar={<ProfileBadge {...owner} />}
        title={
          <Col span={24}>
            <Row>
              <Col span={6}>
                <h4>{owner.username}</h4>
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
          <Col span={24}>
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
      <div className="ant-descriptions-header">
        <div className="ant-descriptions-title">Conditions</div>
      </div>

      <Conditions title={null} layout="horizontal" conditions={contract} />
      <Descriptions style={{ marginTop: "32px" }} title="Live progress" bordered column={1} layout={"horizontal"}>
        {ytMinViewCount && (
          <Descriptions.Item label={<Statistic title="Youtube views" value={liveYtViewCount} precision={0} />}>
            <Progress percent={ytLiveViewsPercent}></Progress>
          </Descriptions.Item>
        )}
        {ytMinSubscriberCount && (
          <Descriptions.Item label={<Statistic title="Youtube subs" value={liveYtSubCount} precision={0} />}>
            <Progress percent={ytLiveSubPercent}></Progress>
          </Descriptions.Item>
        )}
        {twitterMinFollowers && (
          <Descriptions.Item label={<Statistic title="Twitter followers" value={liveTwitterFollowers} precision={0} />}>
            <Progress percent={twitterLiveFollowersPercent}></Progress>
          </Descriptions.Item>
        )}
      </Descriptions>
      <Descriptions
        style={{ marginTop: "32px" }}
        title={
          <Col span={24}>
            <Row>
              <Col span={6}>
                <span>Contract state</span>
              </Col>
              <Col span={18}>
                <Button
                  disabled={isSuccessful}
                  style={{ float: "right" }}
                  onClick={async () => {
                    openConditionsModal(contract);
                  }}
                >
                  Update state
                </Button>
              </Col>
            </Row>
          </Col>
        }
        bordered
        column={1}
        layout={"horizontal"}
      >
        <Descriptions.Item label={<Statistic title="Balance (ETH)" value={balanceETH} precision={4} />}>
          <Progress percent={balancePercent}></Progress>
        </Descriptions.Item>
        {ytMinViewCount && (
          <Descriptions.Item label={<Statistic title="Youtube views" value={ytViews} precision={0} />}>
            <Progress percent={ytViewsPercent}></Progress>
          </Descriptions.Item>
        )}
        {ytMinSubscriberCount && (
          <Descriptions.Item label={<Statistic title="Youtube subs" value={ytSubs} precision={0} />}>
            <Progress percent={ytSubsPercent}></Progress>
          </Descriptions.Item>
        )}
        {twitterMinFollowers && (
          <Descriptions.Item label={<Statistic title="Twitter followers" value={twitterFollowers} precision={0} />}>
            <Progress percent={twitterFollowersPercent}></Progress>
          </Descriptions.Item>
        )}
      </Descriptions>
      <Divider type="horizontal" style={{ marginBottom: "64px" }} />
    </List.Item>
  );
};

const ResultsModal = ({ visible, title, onOk, onCancel, needsLink, isSuccessful }) => {
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
          <h1>Checking conditions...</h1>
          <Spin style={{ width: "100%" }} size="large" />
        </div>
      ) : (
        <Result
          title={
            needsLink
              ? "Make sure you have at least 0.1 LINK and some ETH to pay for the transaction"
              : "Make sure you have some ETH to pay for the transaction"
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
      <Divider type="horizontal" style={{ marginBottom: "64px" }} />
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
      <h1 style={{ fontSize: "2.4rem", width: "100%" }}>Contracts I created</h1>
      <Divider type="horizontal" style={{ marginBottom: "64px" }} />
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
      <ResultsModal
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
      ></ResultsModal>
    </>
  );
}
