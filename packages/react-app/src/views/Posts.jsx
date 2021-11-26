import { Row, Col, List, Avatar, Menu, Button, message, Divider, Badge, Pagination } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Link, Switch, Route, useLocation } from "react-router-dom";
import { useAuthentication, useMyContracts, useRemoteStorage } from "../providers";
import { PostDetail, PostEditorModal, OfferList, ProfileBadge } from "../components";
import { MyContracts, MyRequests } from "./index";
import { PlusCircleOutlined } from "@ant-design/icons";
import ReactTimeAgo from "react-time-ago";
// import Blockies from "react-blockies";
// import { useThemeSwitcher } from "react-css-theme-switcher";

export default function PostsView() {
  const location = useLocation();
  const { profile: myProfile } = useAuthentication();
  const remoteStorage = useRemoteStorage();
  const [isPostModalVisible, setCreatePostModalVisible] = useState(location.search === "?create");
  const [showContractNotification, setShowContractNotification] = useState(false);
  const { event: contractEvent, setEvent: setContractEvent } = useMyContracts();
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
    setRoute(window.location.hash.replace(/^#/, ""));
  }, [setRoute, window.location.hash]);

  useEffect(() => {
    if (!contractEvent.seen && route !== "/me/contracts") {
      setShowContractNotification(true);
    }
  }, [contractEvent, route]);

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
          <Link
            onClick={() => {
              setRoute("/posts/");
            }}
            to="/posts/"
          >
            All
          </Link>
        </Menu.Item>
        <Menu.Item key="/me/requests">
          <Link
            onClick={() => {
              setRoute("/me/requests");
            }}
            to="/me/requests"
          >
            My requests
          </Link>
        </Menu.Item>
        <Menu.Item key="/me/offers">
          <Link
            onClick={() => {
              setRoute("/me/offers");
            }}
            to="/me/offers"
          >
            Offers I have made
          </Link>
        </Menu.Item>
        <Menu.Item key="/me/contracts">
          <Link
            onClick={() => {
              setRoute("/me/contracts");
              setContractEvent({ seen: true });
              setShowContractNotification(false);
            }}
            to="/me/contracts"
          >
            <Badge dot={showContractNotification}>My contracts</Badge>
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
          <Row style={{ marginTop: "16px" }}>
            <Col span={12}>
              <List
                style={{ marginLeft: "32px" }}
                itemLayout="horizontal"
                dataSource={posts}
                renderItem={post => {
                  const { author, title, createdAt } = post;
                  return (
                    <Link to={`/posts/${post.objectId}`}>
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            // <Avatar
                            //   size={32}
                            //   alt={author.username}
                            //   src={author.profilePicture || <Blockies seed={author.ethAddress.toLowerCase()} />}
                            // ></Avatar>
                            <ProfileBadge {...author} />
                          }
                          title={title}
                          description={createdAt && <ReactTimeAgo date={new Date(createdAt)} locale="en-US" />}
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
            <Col span={12}>
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
