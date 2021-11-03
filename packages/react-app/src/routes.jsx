import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { PostCreateView, HomeView, PostsView, PostDetailView } from "./views";

export const Routes = () => {
  return (
    <Switch>
      <Route exact path="/" component={() => <HomeView />} />
      <Route path="/posts" component={() => <PostsView />} />
      <Route exact path="/posts/:id" component={() => <PostDetailView />} />
      <Route path="/post/create" component={() => <PostCreateView />} />
    </Switch>
  );
};
