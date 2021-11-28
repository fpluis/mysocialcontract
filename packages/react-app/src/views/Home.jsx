import { Col, Row, Typography, List, Button } from "antd";
import React from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { Link, Route, Switch } from "react-router-dom";
import { useAuthentication } from "../providers";
import "./Home.css";

export default function HomeView() {
  const { login } = useAuthentication();
  const { currentTheme } = useThemeSwitcher();
  return (
    <Row className="home-container">
      <Switch>
        <Route path="/help/requester">
          <Col span={24}>
            <List
              header={<h1 style={{ textAlign: "center" }}>Tips to get started</h1>}
              className="instructions-list"
              size="large"
              bordered
            >
              <List.Item>
                <Typography.Text>
                  1. Make sure you have{" "}
                  <a rel="noopener noreferrer" target="_blank" href="https://metamask.io/">
                    MetaMask
                  </a>{" "}
                  installed to use this site.
                </Typography.Text>
              </List.Item>
              <List.Item>
                <Typography.Text>
                  2. When you are ready{" "}
                  <Button
                    onClick={async () => {
                      await login({ signingMessage: "Log into Mysocialcontract" });
                    }}
                  >
                    Log In
                  </Button>{" "}
                  using your MetaMask wallet
                </Typography.Text>
              </List.Item>
              <List.Item>
                <Typography.Text>
                  3. <Link to="/posts/">Browse user requests</Link> to get an idea of how much other requesters pay and
                  what conditions they look for.
                </Typography.Text>
              </List.Item>
              <List.Item>
                <Typography.Text>
                  4. You can <Link to="/posts/?create">create a request for promotion</Link> for free at any time.
                </Typography.Text>
              </List.Item>
              <List.Item>
                <Typography.Text>
                  5. Marketers can message you privately on <Link to="/chat">the chat</Link>. Negotiate conditions that
                  satisfy your needs.
                </Typography.Text>
              </List.Item>
              <List.Item>
                <Typography.Text>
                  6. <Link to="/me/requests">Keep track of the offers you receive and edit your posts</Link>. You can
                  reply to the offeror using the message button at the offer&apos;s top right.
                </Typography.Text>
              </List.Item>
              <List.Item>
                <Typography.Text>
                  7. When you are ready to sign a contract, click the button at the top right and review the conditions.
                  You will need Ethereum for the initial deposit and for a small fee.
                </Typography.Text>
              </List.Item>
              <List.Item>
                <Typography.Text>
                  8. <Link to="/me/requests">Check on your contract&apos;s status at any time</Link>. When the
                  contract&apos;s deadline is over, you will be able to withdraw your share. If the contract failed, you
                  get your entire deposit back.
                </Typography.Text>
              </List.Item>
            </List>
          </Col>
        </Route>
        <Route path="/help/provider">
          <Col span={24}>
            <List
              header={<h1 style={{ textAlign: "center" }}>Tips to get started</h1>}
              className="instructions-list"
              size="large"
              bordered
            >
              <List.Item>
                <Typography.Text>
                  1. Make sure you have{" "}
                  <a rel="noopener noreferrer" target="_blank" href="https://metamask.io/">
                    MetaMask
                  </a>{" "}
                  installed to use this site.
                </Typography.Text>
              </List.Item>
              <List.Item>
                <Typography.Text>
                  2. When you are ready{" "}
                  <Button
                    onClick={async () => {
                      const user = await login({ signingMessage: "Log into Mysocialcontract" });
                      console.log(`Logged in as user ${JSON.stringify(user)}`);
                    }}
                  >
                    Log In
                  </Button>{" "}
                  using your MetaMask wallet
                </Typography.Text>
              </List.Item>
              <List.Item>
                <Typography.Text>
                  3. <Link to="/posts/">Browse user requests</Link>. You can message the posters privately or make them
                  an offer.
                </Typography.Text>
              </List.Item>
              <List.Item>
                <Typography.Text>
                  4. Keep track of <Link to="/me/offers">your requests</Link> and{" "}
                  <Link to="/chat">your private chats</Link>.
                </Typography.Text>
              </List.Item>
              <List.Item>
                <Typography.Text>
                  5. After a user signs a contract from one of your offers,{" "}
                  <Link to="/me/contracts">you can watch its progress</Link>. Once the contract&apos;s deadline is over,
                  you will have one day to update the contract&apos;s state. For that, you will need to have 1 LINK to
                  fund the contract so it can verify all the conditions.
                </Typography.Text>
              </List.Item>
              <List.Item>
                <Typography.Text>6. If the contract is successful, you can withdraw your share.</Typography.Text>
              </List.Item>
            </List>
          </Col>
        </Route>
        <Route path="/">
          <Col span={24} style={{ textAlign: "center" }}>
            <img
              className={`img ${currentTheme}`}
              src="/mysocialcontract.svg"
              style={{
                width: "128px",
                height: "128px",
                position: "absolute",
                top: "15%",
                left: "50%",
                marginRight: "-50%",
                transform: "translate(-50%, -50%)",
                opacity: 0.2,
              }}
            ></img>
            <h1
              style={{
                fontSize: "2.4rem",
                marginBottom: "128px",
                zIndex: 1,
              }}
            >
              Mysocialcontract
            </h1>

            <Row>
              <Col span={24}>
                <p>Are you...</p>
              </Col>
            </Row>
            <Row>
              <Col span={24} md={12}>
                <Link style={{ fontSize: "24px", height: "50px" }} to="/help/requester">
                  <Button style={{ fontSize: "24px", height: "50px" }}>Looking for help with marketing</Button>
                </Link>
              </Col>
              <Col span={24} md={12}>
                <Link style={{ fontSize: "24px", height: "50px" }} to="/help/provider">
                  <Button style={{ fontSize: "24px", height: "50px" }}>Offering your marketing experience</Button>
                </Link>
              </Col>
            </Row>
          </Col>
        </Route>
      </Switch>
    </Row>
  );
}
