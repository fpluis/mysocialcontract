import { Row, Col, List, Avatar, Menu, Input, InputNumber, Button, Form, message } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Link, Switch, Route } from "react-router-dom";
import { useRemoteStorage } from "../providers";
import Blockies from "react-blockies";
import { PostDetail } from "../components";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useThemeSwitcher } from "react-css-theme-switcher";
// import Form from "rc-field-form/es/Form";

export default function PostsView() {
  const remoteStorage = useRemoteStorage();
  const [posts, setPosts] = useState([]);
  const [params, setParams] = useState({});
  const [page, setPage] = useState(0);
  const [route, setRoute] = useState("/posts/");

  const submit = async props => {
    console.log(`Props: ${JSON.stringify(props)}`);
    await remoteStorage.putPost(props);
    message.success("Post successfully created!");
    // setTimeout(() => {
    //   window.location.href = "/posts/";
    // }, 2000);
  };

  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  const { currentTheme } = useThemeSwitcher();
  const inverseThemeColor = currentTheme === "light" ? "#222222" : "white";

  useMemo(async () => {
    const posts = await remoteStorage.getPosts(params, page);
    setPosts(JSON.parse(JSON.stringify(posts)));
  }, [params, page]);

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
        <Menu.Item key="/posts/create">
          <Link
            onClick={() => {
              setRoute("/posts/create");
            }}
            to="/posts/create"
          >
            Post an offer
          </Link>
        </Menu.Item>
      </Menu>

      <Switch>
        <Route path="/posts/me">{/* TODO */}</Route>
        <Route path="/posts/create">
          <Form
            style={{ marginTop: 64 }}
            name="validate_other"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
            onFinish={submit}
          >
            <Form.Item name="title" label="Title">
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={16} />
            </Form.Item>
            <Form.Item name="share" label="Patron's share">
              <InputNumber min={0} max={100} placeholder="Between 0 and 100" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="threshold" label="Threshold gains">
              <InputNumber placeholder="In ETH" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              wrapperCol={{
                span: 12,
                offset: 6,
              }}
            >
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
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
