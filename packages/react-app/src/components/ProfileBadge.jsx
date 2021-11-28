import { Avatar, Col, Row, Popover, Statistic } from "antd";
import React from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";
import Blockies from "react-blockies";
import { CheckSquareOutlined, EyeOutlined, TeamOutlined } from "@ant-design/icons";
import "./ProfileBadge.css";

// From https://stackoverflow.com/questions/9461621/format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900
const amountsFormatter = (num, digits) => {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
};

export default function ProfileBadge({ username, profilePicture, ethAddress, achievements }) {
  const { currentTheme } = useThemeSwitcher();
  if (achievements == null || !achievements.owner || !achievements.provider || !achievements.contractAddresses) {
    return (
      <Avatar
        className={`icon ${currentTheme}`}
        size={48}
        alt={username}
        src={profilePicture || <Blockies size={48} seed={ethAddress.toLowerCase()} />}
      ></Avatar>
    );
  }

  const { owner, provider, contractAddresses } = achievements;
  const content = (
    <Col span={24} style={{ width: "400px" }}>
      <Row>
        <Col span={24}>
          <h4 style={{ textAlign: "center" }}>Helped others gain</h4>
        </Col>
      </Row>
      <Row>
        <Col span={6} className="achievement-item">
          <Statistic title="YT Views" value={amountsFormatter(provider.youtubeViews)} prefix={<EyeOutlined />} />
        </Col>
        <Col span={6} className="achievement-item">
          <Statistic title="YT Subs" value={amountsFormatter(provider.youtubeSubs)} prefix={<TeamOutlined />} />
        </Col>
        <Col span={6} className="achievement-item">
          <Statistic
            title="Twitter followers"
            value={amountsFormatter(provider.twitterFollowers)}
            prefix={<TeamOutlined />}
          />
        </Col>
        <Col span={6} className="achievement-item">
          <Statistic
            title="ETH"
            value={amountsFormatter(owner.ethereum)}
            prefix={<img src="/eth.png" style={{ width: "22px" }} />}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <h4 style={{ textAlign: "center" }}>Gained</h4>
        </Col>
      </Row>
      <Row>
        <Col span={6} className="achievement-item">
          <Statistic title="YT Views" value={amountsFormatter(owner.youtubeViews)} prefix={<EyeOutlined />} />
        </Col>
        <Col span={6} className="achievement-item">
          <Statistic title="YT Subs" value={amountsFormatter(owner.youtubeSubs)} prefix={<TeamOutlined />} />
        </Col>
        <Col span={6} className="achievement-item">
          <Statistic
            title="Twitter followers"
            value={amountsFormatter(owner.twitterFollowers)}
            prefix={<TeamOutlined />}
          />
        </Col>
        <Col span={6} className="achievement-item">
          <Statistic
            title="ETH"
            value={amountsFormatter(owner.ethereum)}
            prefix={<img src="/eth.png" style={{ width: "22px" }} />}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <h4 style={{ textAlign: "center", color: "green", marginTop: "16px" }}>
            {contractAddresses.length} <CheckSquareOutlined /> Successful contracts
          </h4>
        </Col>
      </Row>
    </Col>
  );
  return (
    <Popover placement="bottom" content={content} trigger="hover">
      <Avatar
        className={`icon ${currentTheme}`}
        size={48}
        alt={username}
        src={profilePicture || <Blockies size={48} seed={ethAddress.toLowerCase()} />}
      ></Avatar>
      {contractAddresses.length > 0 && (
        <div style={{ textAlign: "center", color: "green", fontSize: "1rem" }}>
          {contractAddresses.length} <CheckSquareOutlined />
        </div>
      )}
    </Popover>
  );
}
