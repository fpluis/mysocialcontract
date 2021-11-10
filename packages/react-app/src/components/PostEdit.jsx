import React, { useState } from "react";
import { Button, Form, InputNumber, Input } from "antd";

export default function PostEdit({
  onFinish,
  initialValues = {
    title: "",
    description: "",
  },
}) {
  return (
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
  );
}
