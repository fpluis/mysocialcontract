import { Row, Col, List, Avatar, Menu, Button, message, Divider } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Link, Switch, Route } from "react-router-dom";
import { useAuthentication, useRemoteStorage } from "../providers";
import Blockies from "react-blockies";
import { PostDetail, MyRequests, PostEditorModal, OfferList, ContractList } from "../components";
import { PlusCircleOutlined } from "@ant-design/icons";
import ReactTimeAgo from "react-time-ago";
// import { useThemeSwitcher } from "react-css-theme-switcher";

export default function PostsView() {
  const { user } = useAuthentication();
  const remoteStorage = useRemoteStorage();
  const [isPostModalVisible, setCreatePostModalVisible] = useState(false);
  const [posts, setPosts] = useState([]);
  const [params, setParams] = useState({});
  const [page, setPage] = useState(0);
  const [route, setRoute] = useState("/posts/");
  const [myRequests, setMyRequests] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [contractsIOwn, setContractsIOwn] = useState([]);
  const [contractsIProvide, setContractsIProvide] = useState([]);

  const createPost = async props => {
    console.log(`Props: ${JSON.stringify(props)}`);
    const post = await remoteStorage.putPost(props);
    message.success("Post successfully created!");
    setPosts([...posts, post.toJSON()]);
  };

  useEffect(() => {
    console.log(`Window route ${window.location.hash.replace(/^#/, "")}`);
    setRoute(window.location.hash.replace(/^#/, ""));
  }, [setRoute, window.location.hash]);

  // const { currentTheme } = useThemeSwitcher();
  // const inverseThemeColor = currentTheme === "light" ? "#222222" : "white";

  useMemo(async () => {
    const posts = await remoteStorage.getPosts(params, page);
    setPosts(posts);
  }, [params, page]);

  useMemo(async () => {
    console.log(`Route: ${route}`);
    if (route === "/me/requests" && myRequests.length === 0) {
      const myPosts = await remoteStorage.getPosts(params, page, user.id);
      const offers = await remoteStorage.getOffers({ postIds: myPosts.map(({ objectId }) => objectId) });
      console.log(`All offers found for posts ${JSON.stringify(myPosts)}: ${JSON.stringify(offers)}`);
      const withOffers = myPosts.map(post => {
        const { objectId: postId } = post;
        const postOffers = offers.filter(({ postId: offerPostId }) => offerPostId === postId);
        console.log(`Post offers: ${JSON.stringify(postOffers)}`);
        post.offers = postOffers;
        return post;
      });
      setMyRequests(withOffers);
    }

    if (route === "/me/offers" && myOffers.length === 0) {
      const offers = await remoteStorage.getOffers({ authorId: user.id });
      setMyOffers(offers);
      console.log(`My (${user.id}) offers: ${JSON.stringify(offers.map(post => post.toJSON()))}`);
    }

    if (route === "/me/contracts" && remoteStorage.web3Ready && contractsIOwn.length === 0) {
      const contractsIOwn = await remoteStorage.getContracts({ ownerId: user.id });
      setContractsIOwn(contractsIOwn.map(contract => contract.toJSON()));
      console.log(`Contracts I (${user.id}) own: ${JSON.stringify(contractsIOwn.map(contract => contract.toJSON()))}`);
    }

    if (route === "/me/contracts" && remoteStorage.web3Ready && contractsIProvide.length === 0) {
      const contractsIProvide = await remoteStorage.getContracts({ providerId: user.id });
      setContractsIProvide(contractsIProvide.map(contract => contract.toJSON()));
      console.log(
        `Contracts I (${user.id}) provider: ${JSON.stringify(contractsIOwn.map(contract => contract.toJSON()))}`,
      );
    }
  }, [route, remoteStorage.web3Ready]);

  const rejectOffer = async offer => {
    const result = await remoteStorage.setOfferStatus(offer.objectId, "rejected");
    console.log(`Offer ${JSON.stringify(offer)} rejected:`, result);
  };

  console.log(`Posts: ${JSON.stringify(posts)}`);
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
            }}
            to="/me/contracts"
          >
            My contracts
          </Link>
        </Menu.Item>
        <Button
          icon={<PlusCircleOutlined style={{ fontSize: "22px" }} />}
          onClick={() => setCreatePostModalVisible(true)}
          style={{ border: "none", verticalAlign: "middle" }}
        />
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
            <MyRequests posts={myRequests} />
          </Col>
        </Route>
        <Route path="/me/offers">
          <Col span={24}>
            <OfferList offers={myOffers} onRejectOffer={rejectOffer} />
          </Col>
        </Route>
        <Route path="/me/contracts">
          <Col span={24}>
            <h1>Contracts I created</h1>
            <ContractList contracts={contractsIOwn} />
            <Divider type="horizontal" />
            <h1>Contracts where I provide</h1>
            <ContractList contracts={contractsIProvide} />
          </Col>
        </Route>
        <Route path="/posts/:id?">
          <Row style={{ marginTop: "16px" }}>
            <Col span={12}>
              <List
                itemLayout="horizontal"
                dataSource={posts}
                renderItem={post => {
                  const { author, title, createdAt } = post;
                  return (
                    <Link to={`/posts/${post.objectId}`}>
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              size={32}
                              alt={author.username}
                              src={author.profilePicture || <Blockies seed={author.ethAddress.toLowerCase()} />}
                            ></Avatar>
                          }
                          title={title}
                          description={
                            <>
                              {createdAt && <ReactTimeAgo date={new Date(createdAt)} locale="en-US" />}
                              {/* {" by "}
                              <b>{author.username}</b> */}
                            </>
                          }
                        />
                      </List.Item>
                    </Link>
                  );
                }}
              ></List>
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
