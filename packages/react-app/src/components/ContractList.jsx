import { List, Button, Avatar, Col, Row, Space } from "antd";
import React from "react";
import Blockies from "react-blockies";
import ReactTimeAgo from "react-time-ago";
import { Conditions } from ".";
import { useBlockchain } from "../providers";
// import "./ContractList.css";

const ONE_DAY_IN_SECONDS = 24 * 60 * 60;

export default function ContractList({ contracts = [] }) {
  const blockchain = useBlockchain();
  console.log(`Render contract list with contracts ${JSON.stringify(contracts)}`);
  return (
    <List
      itemLayout="vertical"
      size="small"
      style={{ border: "1px solid rgba(0, 0, 0, 0.06)", marginTop: "16px" }}
      className="contract-list"
    >
      {contracts.map((contract, key) => {
        const { owner, createdAt, contractAddress, isSuccessful } = contract;

        const deadlineInSeconds = contract.endDate;
        const nowInSeconds = new Date().getTime() / 1000;
        const checkDeadline = deadlineInSeconds + ONE_DAY_IN_SECONDS;
        const status = isSuccessful
          ? "Successful"
          : deadlineInSeconds > nowInSeconds
          ? "In Progress"
          : checkDeadline > nowInSeconds
          ? "Finished"
          : "Failed";
        const contractEventListener = blockchain.getContract(contractAddress);
        console.log(`Promotion contract`);
        console.log(contractEventListener);
        contractEventListener.events
          .allEvents({}, function (error, event) {
            console.log(`Firing event callback`);
            console.log(event);
            console.log(error);
          })
          .on("connected", function (subscriptionId) {
            console.log(`Event subscription created`, subscriptionId);
          })
          .on("data", function (event) {
            console.log(`Event changed`, event);
          })
          .on("changed", function (event) {
            console.log(`Event changed`, event);
          })
          .on("error", function (error, receipt) {
            console.log(`Event error`, error, receipt);
          });
        return (
          <List.Item key={key}>
            <List.Item.Meta
              avatar={
                <Avatar
                  size={32}
                  alt={owner.username}
                  src={owner.profilePicture || <Blockies seed={owner.ethAddress.toLowerCase()} />}
                ></Avatar>
              }
              title={
                <Col span={24}>
                  <Row>
                    <Col span={12}>
                      <h4>{owner.username}</h4>
                    </Col>
                    <Col span={12}>
                      <Button
                        style={{ float: "right" }}
                        onClick={async () => {
                          const result = await blockchain.checkConditions(contractAddress);
                          console.log(`Check completion result: ${JSON.stringify(result)},`, result);
                        }}
                      >
                        Check completion
                      </Button>
                      <Button style={{ marginRight: "8px", float: "right" }}>
                        <a
                          rel="noopener noreferrer"
                          target="_blank"
                          href={`https://kovan.etherscan.io/address/${contractAddress}`}
                        >
                          View on Etherscan
                        </a>
                      </Button>
                    </Col>
                  </Row>
                </Col>
              }
              description={
                <Col span={24}>
                  <Row>
                    <h4>Status: {status}</h4>
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
            <Conditions title={null} layout="horizontal" conditions={contract} />
          </List.Item>
        );
      })}
    </List>
  );
}
