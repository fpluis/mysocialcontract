import { Row, Col, List, Avatar, Menu, Input, InputNumber, Button, Form, message } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Link, Switch, Route } from "react-router-dom";
import { useAuthentication, useRemoteStorage } from "../providers";
import Blockies from "react-blockies";
import { PostDetail, PostEdit, PostPrivate } from "../components";
// import { useThemeSwitcher } from "react-css-theme-switcher";

export default function PostsView() {
  const { user } = useAuthentication();
  const remoteStorage = useRemoteStorage();
  const [posts, setPosts] = useState([]);
  const [params, setParams] = useState({});
  const [page, setPage] = useState(0);
  const [route, setRoute] = useState("/posts/");
  const [myPosts, setMyPosts] = useState([]);

  const createPost = async props => {
    console.log(`Props: ${JSON.stringify(props)}`);
    const post = await remoteStorage.putPost(props);
    message.success("Post successfully created!");
    setPosts([...posts, JSON.parse(JSON.stringify(post))]);
  };

  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  // const { currentTheme } = useThemeSwitcher();
  // const inverseThemeColor = currentTheme === "light" ? "#222222" : "white";

  useMemo(async () => {
    const posts = await remoteStorage.getPosts(params, page);
    setPosts(JSON.parse(JSON.stringify(posts)));
  }, [params, page]);

  useMemo(async () => {
    if (route === "/posts/me" && myPosts.length === 0) {
      const myPosts = await remoteStorage.getPosts(params, page, user.id);
      setMyPosts(JSON.parse(JSON.stringify(myPosts)));
    }
  }, [route]);

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
        <Menu.Item key="/posts/me">
          <Link
            onClick={() => {
              setRoute("/posts/me");
            }}
            to="/posts/me"
          >
            My requests
          </Link>
        </Menu.Item>
        <Menu.Item key="/posts/create">
          <Link
            onClick={() => {
              setRoute("/posts/create");
            }}
            to="/posts/create"
          >
            Post a request
          </Link>
        </Menu.Item>
      </Menu>

      <Switch>
        <Route path="/posts/me">
          <Col span={24}>
            {myPosts.map((post, key) => (
              <PostPrivate post={post} key={key} />
            ))}
          </Col>
        </Route>
        <Route path="/posts/create">
          <PostEdit onFinish={createPost} />
        </Route>
        <Route path="/posts/:id?">
          {/* <Link to={`/post/create`}>
            <Button
              style={{ border: "none" }}
              icon={<PlusCircleOutlined style={{ color: inverseThemeColor, fontSize: 38 }} />}
            ></Button>
          </Link> */}
          <Row style={{ marginTop: "16px" }}>
            <Col span={12}>
              <List
                itemLayout="horizontal"
                dataSource={posts}
                renderItem={post => {
                  const { author, title, description } = post;
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
                          description={description}
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
