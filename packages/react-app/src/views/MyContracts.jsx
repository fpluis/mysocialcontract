import { List, Button, Col, Row, Descriptions, Progress, Divider, Statistic } from "antd";
import React from "react";
import ReactTimeAgo from "react-time-ago";
import { Conditions, ProfileBadge } from "../components";
import { useAuthentication, useBlockchain, useMyContracts } from "../providers";

const ONE_DAY_IN_SECONDS = 24 * 60 * 60;

const renderContract = ({ contract, key, myEthAddress, withdraw, checkConditions }) => {
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

  // console.log(`Render contract ${JSON.stringify(contract)}`);

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
  // console.log(
  //   `Live yt sub count ${liveYtSubCount}, min sub count ${ytMinSubscriberCount}; div ${
  //     liveYtSubCount / ytMinSubscriberCount
  //   }; percent: ${ytLiveSubPercent}`,
  // );
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

  // console.log(
  //   `My eth address: ${myEthAddress}; provider eth address ${provider.ethAddress}; owner ${owner.ethAddress}; isOwnerPaid ${isOwnerPaid}; isProviderPaid ${isProviderPaid}; status ${status}`,
  // );

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
                  style={{ float: "right" }}
                  onClick={async () => {
                    const result = await checkConditions(contract);
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
    </List.Item>
  );
};

export default function ContractList() {
  const {
    profile: { userId: myUserId, ethAddress: myEthAddress },
  } = useAuthentication();
  const blockchain = useBlockchain();
  const { contracts } = useMyContracts();

  const withdraw = async contract => {
    const result = await blockchain.withdraw(contract.contractAddress);
  };

  const checkConditions = contract => {
    return blockchain.checkConditions(contract);
  };

  const listProps = {
    itemLayout: "vertical",
    size: "small",
    style: { border: "1px solid rgba(0, 0, 0, 0.06)", marginTop: "16px" },
    className: "contract-list",
  };

  const contractsIOwn = contracts.filter(contract => contract.ownerId === myUserId);
  const contractsIProvide = contracts.filter(contract => contract.providerId === myUserId);
  // console.log(
  //   `Contracts I (${myUserId}) own: ${JSON.stringify(contractsIOwn)}; provide: ${JSON.stringify(contractsIOwn)}`,
  // );
  return (
    <>
      <h1 style={{ marginLeft: "16px", marginTop: "16px" }}>Contracts I created</h1>
      <List
        {...listProps}
        dataSource={contractsIOwn}
        renderItem={(contract, index) =>
          renderContract({
            contract,
            key: index,
            myEthAddress,
            withdraw,
            checkConditions,
          })
        }
      />
      <Divider type="horizontal" />
      <h1>Contracts where I provide</h1>
      <List
        {...listProps}
        dataSource={contractsIProvide}
        renderItem={(contract, index) =>
          renderContract({
            contract,
            key: index,
            myEthAddress,
            withdraw,
            checkConditions,
          })
        }
      />
    </>
  );
}
