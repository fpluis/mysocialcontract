import React from "react";
import { Button, Form, DatePicker, InputNumber, Input, Modal } from "antd";
import moment from "moment";

export default function OfferModal({ visible, onCancel, onOk, title, post }) {
  const initialValues = {
    comment: "",
    initialDeposit: post.initialDeposit || 0,
    share: post.share,
    thresholdETH: post.thresholdETH || null,
    endDate: moment(post.endDate * 1000),
    ytMinViewCount: post.ytMinViewCount,
    ytMinSubscriberCount: post.ytMinSubscriberCount,
    twitterMinFollowers: post.twitterMinFollowers,
  };
  return (
    <Modal visible={visible} title={title} footer={null} onCancel={onCancel}>
      <Form
        initialValues={initialValues}
        // style={{ marginTop: 64 }}
        name="validate_other"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 14 }}
        onFinish={onOk}
      >
        <Form.Item
          name="initialDeposit"
          label="Initial deposit"
          tooltip="The amount the requester deposits at the start of the contract. If the contract fails, the requester gets it all back."
        >
          <InputNumber placeholder="In ETH" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="share"
          label="Provider's share"
          tooltip="The percentage of the contract funds that the provider receives if the contract succeeds"
        >
          <InputNumber min={0} max={100} placeholder="Between 0 and 100" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="thresholdETH"
          label="Threshold funds"
          tooltip="The minimum ETH that the contract must have by the deadline to succeed"
        >
          <InputNumber placeholder="In ETH" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="endDate"
          label="Deadline"
          tooltip="The provider will have 1 day after this date to check the contract's conditions."
        >
          <DatePicker />
        </Form.Item>
        {post.ytChannelId && (
          <>
            <Form.Item
              name="ytMinViewCount"
              label="Youtube Views"
              tooltip="The minimum Youtube views that your channel must have by the deadline to succeed"
            >
              <InputNumber placeholder="When the contract ends" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="ytMinSubscriberCount"
              label="Youtube Subscribers"
              tooltip="The minimum Youtube subscribers that your channel must have by the deadline to succeed"
            >
              <InputNumber placeholder="When the contract ends" style={{ width: "100%" }} />
            </Form.Item>
          </>
        )}
        {post.twitterUsername && (
          <>
            <Form.Item
              name="twitterMinFollowers"
              label="Twitter followers"
              tooltip="The minimum Twitter followers that your account must have by the deadline to succeed"
            >
              <InputNumber placeholder="When the contract ends" style={{ width: "100%" }} />
            </Form.Item>
          </>
        )}
        <Form.Item name="comment" label="Comment">
          <Input.TextArea rows={8} />
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
