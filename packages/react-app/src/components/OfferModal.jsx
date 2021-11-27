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
        <Form.Item name="initialDeposit" label="Initial deposit">
          <InputNumber placeholder="In ETH" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="share" label="Provider's share">
          <InputNumber min={0} max={100} placeholder="Between 0 and 100" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="thresholdETH" label="Threshold funds">
          <InputNumber placeholder="In ETH" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="endDate" label="Deadline">
          <DatePicker />
        </Form.Item>
        {post.ytChannelId && (
          <>
            <Form.Item name="ytMinViewCount" label="Youtube Views">
              <InputNumber placeholder="When the contract ends" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="ytMinSubscriberCount" label="Youtube Subscribers">
              <InputNumber placeholder="When the contract ends" style={{ width: "100%" }} />
            </Form.Item>
          </>
        )}
        {post.twitterUsername && (
          <>
            <Form.Item name="twitterMinFollowers" label="Twitter followers">
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
