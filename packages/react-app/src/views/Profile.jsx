import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload, Col, Row, Form, Input } from "antd";
import React, { useState, useMemo } from "react";
import { useAuthentication, useRemoteStorage } from "../providers";

const profilePictureUpload = event => {
  console.log("Upload event:", event);

  if (Array.isArray(event)) {
    return event;
  }

  return event && event.profilePictureUpload;
};

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};

const AvatarUpload = ({ initialImage, customRequest, maxSizeInMB, listType = "picture" }) => {
  const [imageUrl, setImageUrl] = useState(initialImage || "");

  const beforeUpload = file => {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      message.error("Please, upload eithera  JPG or a PNG image.");
      return false;
    }

    if (maxSizeInMB && file.size / 1024 / 1024 > maxSizeInMB) {
      message.error(`The image is too large, please use an image smaller than ${maxSizeInMB}MB.`);
      return false;
    }

    return true;
  };

  const handleChange = info => {
    console.log(`Change:`, info);
    if (info.file.originFileObj) {
      getBase64(info.file.originFileObj, imageUrl => {
        setImageUrl(imageUrl);
      });
    }
  };

  return (
    <Upload
      listType={listType || "picture"}
      className="avatar-uploader"
      showUploadList={false}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      customRequest={customRequest}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="avatar" style={{ width: "100%", cursor: "pointer" }} />
      ) : (
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      )}
    </Upload>
  );
};

export default function ProfileView() {
  const { user, updateUser, setUserAttribute, logOut } = useAuthentication();
  const [props, setProps] = useState({});

  useMemo(() => {
    if (user.authenticated()) {
      const { username, description, profilePicture } = user.toJSON();
      console.log(`Setting props from ${JSON.stringify(user)}`);
      const props = { username, description };

      if (profilePicture && profilePicture.url) {
        props.profilePicture = profilePicture.url;
      }

      setProps(props);
    }
  }, [user.authenticated()]);

  return (
    <>
      <Col span={24}>
        <Row style={{ margin: "0 30px", textAlign: "left", fontSize: "1.4rem" }}>
          <Col span={24} style={{ margin: "0 auto" }}>
            <Form
              initialValues={{
                description: props.description,
                username: props.username,
              }}
              style={{ marginTop: 64 }}
              name="validate_other"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 14 }}
              onFinish={async formProps => {
                console.log(`Form props: ${JSON.stringify(formProps)}`);
                const { username, description } = formProps;
                if (username.length > 0) {
                  setUserAttribute("username", username);
                }

                if (description.length > 0) {
                  setUserAttribute("description", description);
                }

                await updateUser();
                message.success("Profile updated successfully!");
              }}
            >
              <Form.Item label="Profile Picture">
                <Form.Item valuePropName="profilePicture" getValueFromEvent={profilePictureUpload} noStyle>
                  <AvatarUpload
                    initialImage={props.profilePicture}
                    customRequest={async args => {
                      setUserAttribute("profilePicture", args, true);
                    }}
                    maxSizeInMB={4}
                    listType="picture-card"
                  />
                </Form.Item>
              </Form.Item>
              <Form.Item name="username" label="Username">
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={16} />
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
            <Button
              style={{ backgroundColor: "#d50000" }}
              onClick={async () => {
                await logOut();
                message.success("Logged out. Redirecting to homepage.");
                setTimeout(() => {
                  window.location.replace(new URL(document.URL).origin);
                }, 1000);
              }}
            >
              Log out
            </Button>
          </Col>
        </Row>
      </Col>
    </>
  );
}
