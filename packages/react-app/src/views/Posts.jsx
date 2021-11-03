import { Row, Col, List, Avatar } from "antd";
import React, { useMemo, useState } from "react";
import { Link, Switch, Route } from "react-router-dom";
import { useRemoteStorage } from "../providers";
import Blockies from "react-blockies";
import { PostDetail } from "../components";

export default function PostsView() {
  const remoteStorage = useRemoteStorage();
  const [posts, setPosts] = useState([]);
  const [params, setParams] = useState({});
  const [page, setPage] = useState(0);

  useMemo(async () => {
    const posts = await remoteStorage.getPosts(params, page);
    setPosts(posts);
  }, [params, page]);

  console.log(`Posts: ${JSON.stringify(posts)}`);
  return (
    <>
      <h2>Latest posts</h2>
      <Row>
        <Col span={12}>
          <List
            itemLayout="horizontal"
            dataSource={posts}
            renderItem={post => {
              const author = post.get("author");
              const title = post.get("title");
              const description = post.get("description");
              return (
                <Link to={`/posts/${post.id}`}>
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
              <Route key={key} exact path={`/posts/${post.id}`} component={() => <PostDetail post={post} />}></Route>
            ))}
          </Switch>
        </Col>
      </Row>
    </>
  );
}
