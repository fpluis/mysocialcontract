import { Row, Col, List, Avatar, Menu, Button, message, Divider, Badge, Pagination } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Link, Switch, Route, useLocation } from "react-router-dom";
import { useAuthentication, useMyContracts, useRemoteStorage } from "../providers";
import { PostDetail, PostEditorModal, OfferList, ProfileBadge } from "../components";
import { MyContracts, MyRequests } from "./index";
import { PlusCircleOutlined, TwitterOutlined, YoutubeOutlined } from "@ant-design/icons";
import ReactTimeAgo from "react-time-ago";
// import Blockies from "react-blockies";
// import { useThemeSwitcher } from "react-css-theme-switcher";

export default function PostsView() {
  const location = useLocation();
  const { notifications, setNotification, profile: myProfile } = useAuthentication();
  const remoteStorage = useRemoteStorage();
  const [isPostModalVisible, setCreatePostModalVisible] = useState(location.search === "?create");
  const [posts, setPosts] = useState([]);
  const [params, setParams] = useState({});
  const [page, setPage] = useState(0);
  const [route, setRoute] = useState("/posts/");
  const [myOffers, setMyOffers] = useState([]);
  const [postCount, setPostCount] = useState(0);

  useMemo(() => {
    remoteStorage.countPosts().then(count => {
      setPostCount(count);
    });
  }, [remoteStorage]);

  const createPost = async props => {
    const post = await remoteStorage.putPost(props);
    message.success("Post successfully created!");
    setPosts(posts => [post.toJSON(), ...posts]);
  };

  useEffect(() => {
    const newRoute = window.location.hash.replace(/^#/, "");
    console.log(`New route: ${JSON.stringify(newRoute)}`);
    setRoute(newRoute);
    if (newRoute === "/me/offers" && notifications.offers === true) {
      console.log(`@offers`);
      setNotification("offers", false);
    }

    if (newRoute === "/me/requests" && notifications.requests === true) {
      console.log(`@requests`);
      setNotification("requests", false);
    }

    if (newRoute === "/me/contracts" && notifications.contracts === true) {
      console.log(`@contracts`);
      setNotification("contracts", false);
    }
  }, [setRoute, notifications, window.location.hash]);

  useMemo(async () => {
    const posts = await remoteStorage.getPosts({ ...params, status: "active", page: page - 1 });
    setPosts(posts);
  }, [params, page]);

  useMemo(async () => {
    if (myProfile.userId) {
      if (route === "/me/offers" && myOffers.length === 0) {
        const offers = await remoteStorage.getOffers({ authorId: myProfile.userId });
        setMyOffers(offers);
      }
    }
  }, [route, remoteStorage.web3Ready, myProfile]);

  return (
    <>
      <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
        <Menu.Item key="/posts/">
          <Link to="/posts/">All</Link>
        </Menu.Item>
        <Menu.Item key="/me/requests">
          <Link to="/me/requests">
            <Badge dot={notifications.requests}>My requests</Badge>
          </Link>
        </Menu.Item>
        <Menu.Item key="/me/offers">
          <Link to="/me/offers">
            <Badge dot={notifications.offers}>Offers I have made</Badge>
          </Link>
        </Menu.Item>
        <Menu.Item key="/me/contracts">
          <Link to="/me/contracts">
            <Badge dot={notifications.contracts}>My contracts</Badge>
          </Link>
        </Menu.Item>
        <Menu.Item key="/posts/create">
          <Button
            icon={<PlusCircleOutlined style={{ margin: 0, fontSize: "22px" }} />}
            onClick={() => setCreatePostModalVisible(true)}
            style={{ border: "none", verticalAlign: "middle" }}
          />
        </Menu.Item>
      </Menu>

      <PostEditorModal
        visible={isPostModalVisible}
        title="Create a new post"
        onCancel={() => setCreatePostModalVisible(false)}
        onOk={async props => {
          await createPost(props);
          setCreatePostModalVisible(false);
        }}
      />

      <Switch>
        <Route path="/me/requests">
          <Col span={24}>
            <MyRequests />
          </Col>
        </Route>
        <Route path="/me/offers">
          <Col span={24}>
            <OfferList
              offers={myOffers}
              onRejectOffer={offer => remoteStorage.setOfferStatus(offer.objectId, "rejected")}
            />
          </Col>
        </Route>
        <Route path="/me/contracts">
          <Col span={24}>
            <MyContracts />
          </Col>
        </Route>
        <Route path="/posts/:id?">
          <h1 style={{ fontSize: "2.4rem", width: "100%" }}>All Requests</h1>
          <Row style={{ marginTop: "16px" }}>
            <Col span={8}>
              <List
                style={{ marginLeft: "32px" }}
                itemLayout="horizontal"
                dataSource={posts}
                renderItem={post => {
                  const { author, title, createdAt, twitterUsername, ytChannelId, thresholdETH } = post;
                  return (
                    <Link to={`/posts/${post.objectId}`}>
                      <List.Item>
                        <List.Item.Meta
                          avatar={<ProfileBadge {...author} />}
                          title={
                            <Col span={24}>
                              <Row>
                                <Col span={createdAt ? 18 : 24}>
                                  <h4>{title}</h4>
                                </Col>
                                {createdAt && (
                                  <Col span={6}>
                                    <ReactTimeAgo date={new Date(createdAt)} locale="en-US" />
                                  </Col>
                                )}
                              </Row>
                            </Col>
                          }
                          description={
                            <Row>
                              {twitterUsername && (
                                <TwitterOutlined style={{ color: "#1DA1F2", fontSize: "18px", marginRight: "8px" }} />
                              )}
                              {ytChannelId && (
                                <YoutubeOutlined style={{ color: "#e52d27", fontSize: "18px", marginRight: "8px" }} />
                              )}
                              {thresholdETH && <img src="/eth.png" style={{ width: "18px" }} />}
                            </Row>
                          }
                        />
                      </List.Item>
                    </Link>
                  );
                }}
              ></List>
              <Pagination
                defaultCurrent={1}
                defaultPageSize={8}
                onChange={page => {
                  setPage(page);
                }}
                total={postCount}
              ></Pagination>
            </Col>
            <Col span={16} style={{ paddingLeft: "16px" }}>
              <Switch>
                {posts.map((post, key) => (
                  <Route
                    key={key}
                    exact
                    path={`/posts/${post.objectId}`}
                    component={() => <PostDetail post={post} />}
                  ></Route>
                ))}
              </Switch>
            </Col>
          </Row>
        </Route>
      </Switch>
    </>
  );
}
