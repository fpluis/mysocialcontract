import { Button, Form, Input, InputNumber, message } from "antd";
import React from "react";
import { useRemoteStorage } from "../providers";

export default function RequestCreate() {
  const remoteStorage = useRemoteStorage();

  const submit = async requestProps => {
    console.log(`Props: ${JSON.stringify(requestProps)}`);
    await remoteStorage.putRequest(requestProps);
    message.success("Profile updated successfully!");
  };

  return (
    <>
      <Form
        style={{ marginTop: 64 }}
        name="validate_other"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 14 }}
        onFinish={submit}
      >
        <Form.Item name="title" label="Title">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={16} />
        </Form.Item>
        <Form.Item name="share" label="Publicist share">
          <InputNumber autoFocus min={0} max={100} placeholder="Between 0 and 100" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="threshold" label="Threshold gains">
          <InputNumber autoFocus placeholder="In ETH" style={{ width: "100%" }} />
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
    </>
  );
}
