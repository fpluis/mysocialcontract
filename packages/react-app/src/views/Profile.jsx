import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload } from "antd";
import React, { useState } from "react";
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
    if (info.file.status === "uploading") {
      return;
    }

    if (info.file.status === "done") {
      // Get this url from response in real world.
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
      // customRequest={customRequest}
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
  const { logOut } = useAuthentication();
  return (
    <>
      <AvatarUpload></AvatarUpload>
      <Button onClick={() => logOut()}>Log out</Button>
    </>
  );
}
