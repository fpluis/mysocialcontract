import React from "react";
import { Route, Switch } from "react-router-dom";
import { HomeView, PostsView, ChatView, ProfileView } from "./views";

export const Routes = () => {
  return (
    <Switch>
      <Route exact path="/" component={() => <HomeView />} />
      <Route exact path="/help/:instructions?" component={() => <HomeView />} />
      <Route exact path="/profile/" component={() => <ProfileView />} />
      <Route path="/chat/:id?" component={() => <ChatView />} />
      <Route path="/posts" component={() => <PostsView />} />
      <Route path="/me/requests/" component={() => <PostsView />} />
      <Route path="/me/offers/" component={() => <PostsView />} />
      <Route path="/me/contracts/" component={() => <PostsView />} />
    </Switch>
  );
};
