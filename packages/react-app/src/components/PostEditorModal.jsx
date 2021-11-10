import React from "react";
import { Button, Form, InputNumber, Input, Modal } from "antd";

export default function PostEditorModal({
  visible,
  onCancel,
  onFinish,
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
        onFinish={onFinish}
      >
        <Form.Item name="title" label="Title">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={16} />
        </Form.Item>
        <Form.Item name="share" label="Patron's share">
          <InputNumber min={0} max={100} placeholder="Between 0 and 100" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="threshold" label="Threshold gains">
          <InputNumber placeholder="In ETH" style={{ width: "100%" }} />
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
