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
        style={{ marginTop: 64 }}
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
          name="endDate"
          label="Deadline"
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
          name="initialDeposit"
          label="Initial deposit"
          rules={[
            {
              required: true,
              message: "Please specify the initial amount of ETH you will deposit when you create the contract",
            },
          ]}
        >
          <InputNumber placeholder="In ETH" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="thresholdETH" label="Threshold funds">
          <InputNumber placeholder="In ETH" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="ytChannelName" label="Youtube channel name">
          <Input.Search
            placeholder="Search the Youtube channel id by name"
            loading={isSearching}
            onSearch={username => {
              setIsSearching(true);
              console.log(`Search for youtube channel ${username}`);
              Moralis.Cloud.run("getYoutubeChannelId", {
                username,
              }).then(ytChannelId => {
                console.log(`Response: ${ytChannelId}`);
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
            placeholder="Use the search above or input directly"
            onChange={event => {
              const { value } = event.target;
              console.log(`Value, `, value);
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
            onChange={event => {
              const { value } = event.target;
              console.log(`Value, `, value);
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
