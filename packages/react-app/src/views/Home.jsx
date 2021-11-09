import { Button, Col, Row } from "antd";
import React from "react";
import "./Home.css";

export default function HomeView() {
  return (
    <Row className="home-container">
      <Col span={24}>
        <Row>
          <Col span={24}>
            <p>Are you...</p>
          </Col>
        </Row>
        <Row>
          <Col span={24} md={12}>
            <Button>Looking for help with marketing</Button>
          </Col>
          <Col span={24} md={12}>
            <Button>Offering your marketing experience</Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
