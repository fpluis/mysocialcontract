import { Row, Col, List, Avatar, Menu, Button, message, Divider, Badge, Pagination } from "antd";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, Switch, Route, useLocation } from "react-router-dom";
import { useAuthentication, useMyContracts, useRemoteStorage } from "../providers";
import { PostDetail, PostEditorModal, OfferList, ProfileBadge } from "../components";
import { MyContracts, MyRequests } from "./index";
import { PlusCircleOutlined, TwitterOutlined, YoutubeOutlined } from "@ant-design/icons";
import ReactTimeAgo from "react-time-ago";
// import { useThemeSwitcher } from "react-css-theme-switcher";

const PAGE_SIZE = 6;

export default function PostsView() {
  const location = useLocation();
  const { notifications, setNotification, profile: myProfile } = useAuthentication();
  const remoteStorage = useRemoteStorage();
  const [isPostModalVisible, setCreatePostModalVisible] = useState(location.search === "?create");
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [route, setRoute] = useState("/posts/");
  const [myOffers, setMyOffers] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [selected, setSelected] = useState();

  useMemo(() => {
    remoteStorage.countPosts().then(count => {
      setPostCount(count);
    });
  }, [remoteStorage]);

  const createPost = async props => {
    const post = await remoteStorage.putPost(props);
    message.success("Post successfully created!");
    setPosts(posts => (posts.length >= PAGE_SIZE ? [post.toJSON(), ...posts.slice(0, 7)] : [post.toJSON(), ...posts]));
  };

  const changeLocation = useCallback(
    newLocation => {
      window.location.hash = `#${newLocation}`;
    },
    [window.location.hash],
  );

  useEffect(() => {
    const newRoute = window.location.hash.replace(/^#/, "");
    setRoute(newRoute);
    if (newRoute === "/me/offers" && notifications.offers === true) {
      setNotification("offers", false);
    }

    if (newRoute === "/me/requests" && notifications.requests === true) {
      setNotification("requests", false);
    }

    if (newRoute === "/me/contracts" && notifications.contracts === true) {
      setNotification("contracts", false);
    }
  }, [setRoute, notifications, window.location.hash]);

  useMemo(async () => {
    const posts = await remoteStorage.getPosts({ status: "active", page: page - 1 });
    setPosts(posts);
  }, [page]);

  useMemo(async () => {
    if (posts.length > 0 && route === "/posts/") {
      setRoute(`/posts/${posts[0].objectId}`);
      setSelected(posts[0].objectId);
      changeLocation(`/posts/${posts[0].objectId}`);
    }
  }, [posts, route]);

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
            <h1 style={{ fontSize: "2.4rem", width: "100%" }}>Offers I&apos;ve made</h1>
            <Divider type="horizontal" style={{ marginBottom: "16px" }} />
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
          <Divider type="horizontal" style={{ marginBottom: "16px" }} />
          <Row style={{ marginTop: "16px" }}>
            <Col span={8}>
              <List
                style={{ minHeight: "664px" }}
                itemLayout="horizontal"
                dataSource={posts}
                renderItem={post => {
                  const { author, title, createdAt, twitterUsername, ytChannelId, thresholdETH } = post;
                  return (
                    <Link
                      to={`/posts/${post.objectId}`}
                      onClick={() => {
                        if (selected === post.objectId) {
                          // setSelected();
                          // changeLocation("/posts");
                        } else {
                          setSelected(post.objectId);
                        }
                      }}
                    >
                      <List.Item style={selected === post.objectId ? { backgroundColor: "#90caf9" } : {}}>
                        <List.Item.Meta
                          style={{ paddingLeft: "16px" }}
                          avatar={<ProfileBadge {...author} />}
                          title={
                            <Col span={24}>
                              <Row>
                                <Col span={createdAt ? 17 : 24}>
                                  <h4>{title}</h4>
                                </Col>
                                {createdAt && (
                                  <Col span={7}>
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
            </Col>
            <Col span={15} style={{ paddingLeft: "32px" }}>
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
          <Row>
            <Pagination
              defaultCurrent={1}
              defaultPageSize={PAGE_SIZE}
              onChange={page => {
                setPage(page);
              }}
              total={postCount}
            ></Pagination>
          </Row>
        </Route>
      </Switch>
    </>
  );
}
