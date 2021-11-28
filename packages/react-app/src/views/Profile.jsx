import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload, Col, Row, Form, Input } from "antd";
import React, { useState, useMemo } from "react";
import { useAuthentication } from "../providers";

const profilePictureUpload = event => {
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
  const [imageUrl, setImageUrl] = useState(initialImage);

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
  const { user, profile, updateUser, setUserAttribute, logOut } = useAuthentication();
  const [props, setProps] = useState({});
  const [profilePicture, setProfilePicture] = useState();

  useMemo(() => {
    if (user.authenticated() && profile.userId) {
      const { username = "", description = "", profilePicture = { url: "" }, achievements = {} } = profile;
      const props = { username, description };

      if (profilePicture && profilePicture.url) {
        setProfilePicture(profilePicture.url);
      }

      setProps(props);
    }
  }, [user.authenticated(), profile]);

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
                const { username = "", description = "" } = formProps;
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
                  {profile.userId ? (
                    <AvatarUpload
                      initialImage={profilePicture}
                      customRequest={async args => {
                        setUserAttribute("profilePicture", args, true);
                      }}
                      maxSizeInMB={4}
                      listType="picture-card"
                    />
                  ) : (
                    <UploadOutlined />
                  )}
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
                <Col span={24}>
                  <Row>
                    <Button type="primary" htmlType="submit">
                      Submit
                    </Button>
                  </Row>
                  <Row>
                    <Button
                      style={{ backgroundColor: "#d50000", marginTop: "64px", color: "white" }}
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
                  </Row>
                </Col>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Col>
    </>
  );
}
