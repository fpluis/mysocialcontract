import React from "react";
import { Button, Form, DatePicker, InputNumber, Input, Modal } from "antd";

const { RangePicker } = DatePicker;

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
  return (
    <Modal visible={visible} title={title} footer={null} onCancel={onCancel}>
      <Form
        initialValues={initialValues}
        style={{ marginTop: 64 }}
        name="validate_other"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 14 }}
        onFinish={onOk}
      >
        <Form.Item name="title" label="Title" required={true}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={16} />
        </Form.Item>
        <Form.Item name="share" label="Provider's share" required={true}>
          <InputNumber
            // formatter={value => Number(value).toFixed(0)}
            precision={0}
            min={0}
            max={100}
            placeholder="Between 0 and 100"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item name="period" label="Period" required={true}>
          <RangePicker />
        </Form.Item>
        <Form.Item name="initialDeposit" label="Initial deposit" required={true}>
          <InputNumber placeholder="In ETH" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="thresholdETH" label="Threshold funds">
          <InputNumber placeholder="In ETH" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="ytChannelId" label="Youtube channel id">
          <Input />
        </Form.Item>
        <Form.Item name="ytMinViewCount" label="Youtube Views">
          <InputNumber placeholder="When the contract ends" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="ytMinSubscriberCount" label="Youtube Subscribers">
          <InputNumber placeholder="When the contract ends" style={{ width: "100%" }} />
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
