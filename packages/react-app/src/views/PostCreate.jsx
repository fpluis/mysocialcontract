import { Button, Form, Input, InputNumber, message } from "antd";
import React from "react";
import { useRemoteStorage } from "../providers";

export default function PostCreate() {
  const remoteStorage = useRemoteStorage();

  const submit = async props => {
    console.log(`Props: ${JSON.stringify(props)}`);
    await remoteStorage.putPost(props);
    message.success("Post successfully created! Redirecting you to posts list");
    setTimeout(() => {
      window.location.href = "/posts/";
    }, 2000);
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
    </>
  );
}
