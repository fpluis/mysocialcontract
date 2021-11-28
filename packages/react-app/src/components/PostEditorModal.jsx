import Moralis from "moralis";
import React, { useState } from "react";
import { Button, Form, DatePicker, InputNumber, Input, Modal, Tooltip } from "antd";

export default function PostEditorModal({
  visible,
  onCancel,
  onOk,
  title,
  initialValues = {
    title: "",
    description: "",
  },
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [form] = Form.useForm();
  const [hasAddedYtChannel, setHasAddedYtChannel] = useState(false);
  const [hasAddedTwitterUser, setHasAddedTwitterUser] = useState(false);
  return (
    <Modal visible={visible} title={title} footer={null} onCancel={onCancel}>
      <Form
        form={form}
        initialValues={initialValues}
        name="validate_other"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 14 }}
        onFinish={onOk}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[
            {
              required: true,
              message: "Please add a title",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[
            {
              required: true,
              message: "Please describe what you are looking for",
            },
          ]}
        >
          <Input.TextArea rows={16} />
        </Form.Item>
        <Form.Item
          name="share"
          label="Provider's share (%)"
          tooltip="The percentage of the contract funds that the provider receives if the contract succeeds"
          rules={[
            {
              required: true,
              message: "Please specify the provider's share i.e. 20 = 20%",
            },
          ]}
        >
          <InputNumber precision={0} min={0} max={100} placeholder="Between 0 and 100" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="initialDeposit"
          label="Initial deposit"
          tooltip="The amount you deposit at the start of the contract. If the contract fails, you get it all back."
          rules={[
            {
              required: true,
              message: "Please specify the initial amount of ETH you will deposit when you create the contract",
            },
          ]}
        >
          <InputNumber placeholder="In ETH" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="endDate"
          label="Deadline"
          tooltip="The provider will have 1 day after this date to check the contract's conditions."
          rules={[
            {
              required: true,
              message: "Please specify a valid deadline",
            },
          ]}
        >
          <DatePicker />
        </Form.Item>
        <Form.Item
          name="thresholdETH"
          label="Threshold funds"
          tooltip="The minimum ETH that the contract must have by the deadline to succeed"
          rules={[
            {
              required: !hasAddedYtChannel && !hasAddedTwitterUser,
              message: "You have to specify at least a minimum ETH to gain, a Youtube channel or a Twitter user",
            },
          ]}
        >
          <InputNumber placeholder="In ETH" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="ytChannelName"
          label="Youtube channel name"
          tooltip="You can take the channel's name from the channel's homepage URL, which usually looks like 'https://www.youtube.com/c/<CHANNEL_NAME>', where <CHANNEL_NAME> is the value you need to put here."
        >
          <Input.Search
            placeholder="Search the Youtube channel id by name"
            loading={isSearching}
            onSearch={username => {
              setIsSearching(true);
              Moralis.Cloud.run("getYoutubeChannelId", {
                username,
              }).then(ytChannelId => {
                form.setFieldsValue({
                  ytChannelId,
                });
                setIsSearching(false);
                setHasAddedYtChannel(true);
              });
            }}
          ></Input.Search>
        </Form.Item>
        <Form.Item name="ytChannelId" label="Youtube channel id">
          <Input
            disabled={!hasAddedYtChannel}
            placeholder="Use the search above with your channel's name"
            onChange={event => {
              const { value } = event.target;
              if (value === "") {
                setHasAddedYtChannel(false);
              } else {
                setHasAddedYtChannel(true);
              }
            }}
          />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: hasAddedYtChannel,
              message: "If you specify a Youtube channel, you need to set a minimum Youtube view count (can be 0)",
            },
          ]}
          name="ytMinViewCount"
          label="Youtube Views"
          tooltip="The minimum Youtube views that your channel must have by the deadline to succeed"
        >
          <InputNumber
            disabled={!hasAddedYtChannel}
            precision={0}
            min={0}
            placeholder="When the contract ends"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: hasAddedYtChannel,
              message: "If you specify a Youtube channel, you need to set a minimum Youtube sub count (can be 0)",
            },
          ]}
          name="ytMinSubscriberCount"
          label="Youtube Subscribers"
          tooltip="The minimum Youtube subscribers that your channel must have by the deadline to succeed"
        >
          <InputNumber
            disabled={!hasAddedYtChannel}
            precision={0}
            min={0}
            placeholder="When the contract ends"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item name="twitterUsername" label="Twitter username">
          <Input
            placeholder="The Twitter handle without the '@' i.e. 'elonmusk'"
            tooltip="Your Twitter handle without the '@'. You can find this on Twitter by clicking on 'Profile'"
            onChange={event => {
              const { value } = event.target;
              if (value === "") {
                setHasAddedTwitterUser(false);
              } else {
                setHasAddedTwitterUser(true);
              }
            }}
          />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: hasAddedTwitterUser,
              message: "If you specify a Twitter username, you need to set a minimum Twitter followers (can be 0)",
            },
          ]}
          name="twitterMinFollowers"
          label="Twitter followers"
          tooltip="The minimum Twitter followers that your account must have by the deadline to succeed"
        >
          <InputNumber
            disabled={!hasAddedTwitterUser}
            precision={0}
            min={0}
            placeholder="When the contract ends"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          wrapperCol={{
            span: 12,
            offset: 6,
          }}
        >
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
