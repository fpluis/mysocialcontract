import { List, Button, DatePicker, Avatar, Descriptions, Tooltip, Space } from "antd";
import React from "react";
import Blockies from "react-blockies";
import moment from "moment";
import ReactTimeAgo from "react-time-ago";
import { CloseOutlined, FormOutlined } from "@ant-design/icons";
import { Conditions } from ".";
import { useBlockchain } from "../providers";
// import "./ContractList.css";

const { RangePicker } = DatePicker;

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
        const { owner, conditions, createdAt, contractAddress } = contract;

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
          <List.Item
            key={key}
            extra={
              <>
                <Button
                  style={{ marginRight: "8px" }}
                  onClick={async () => {
                    const contractEventListener = blockchain.getContract(contractAddress);
                    contractEventListener.methods
                      .ytViews()
                      .call()
                      .then(youtubeViews => {
                        console.log(`Youtube views: ${youtubeViews}`);
                      });
                    contractEventListener.methods
                      .ytSubs()
                      .call()
                      .then(youtubeViews => {
                        console.log(`Youtube subs: ${youtubeViews}`);
                      });
                    contractEventListener.methods
                      .isSuccessful()
                      .call()
                      .then(isSuccessful => {
                        console.log(`Is successful?: ${isSuccessful}`);
                      });
                  }}
                >
                  Debug
                </Button>
                <Button
                  style={{ marginRight: "8px" }}
                  onClick={async () => {
                    const result = await blockchain.checkConditions(contractAddress);
                    console.log(`Check completion result: ${JSON.stringify(result)},`, result);
                  }}
                >
                  Check completion
                </Button>
                <Button>
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href={`https://kovan.etherscan.io/address/${contractAddress}`}
                  >
                    View on Etherscan
                  </a>
                </Button>
              </>
            }
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  size={32}
                  alt={owner.username}
                  src={owner.profilePicture || <Blockies seed={owner.ethAddress.toLowerCase()} />}
                ></Avatar>
              }
              title={owner.username}
              description={createdAt && <ReactTimeAgo date={new Date(createdAt)} locale="en-US" />}
            />
            {/* <Descriptions title={null} bordered layout="horizontal" column={1}>
              <Descriptions.Item label="Provider">
                <Avatar
                  size={32}
                  alt={provider.username}
                  src={provider.profilePicture || <Blockies seed={provider.ethAddress.toLowerCase()} />}
                ></Avatar>
                {provider.username}
              </Descriptions.Item>
              {share && <Descriptions.Item label="Share">{share}%</Descriptions.Item>}
              {deposit && <Descriptions.Item label="Initial deposit">{deposit}</Descriptions.Item>}
              {startDate && endDate && (
                <Descriptions.Item label="Period">
                  <RangePicker defaultValue={[moment(startDate), moment(endDate)]} disabled />
                </Descriptions.Item>
              )}
            </Descriptions> */}
            <Conditions title={null} layout="horizontal" conditions={conditions} />
          </List.Item>
        );
      })}
    </List>
  );
}
