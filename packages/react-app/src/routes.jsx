import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import { RequestCreateView, HomeView, RequestsView } from "./views";

export const Routes = () => {
  return (
    <>
      <HashRouter basename={"/"}>
        <Switch>
          <Route exact path="/" component={() => <HomeView />} />
          <Route path="/requests" component={() => <RequestsView />} />
          <Route path="/request/create" component={() => <RequestCreateView />} />
        </Switch>
      </HashRouter>
    </>
  );
};
