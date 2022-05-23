import React, {
  Fragment,
  ReactElement,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import {
  Switch,
  Route,
  withRouter,
  RouteComponentProps,
  Redirect,
} from "react-router-dom";

import * as Pages from "./pages";

import { Interfaces, siteConfig } from "../site-config";
import { Location, History } from "history";

interface Props extends RouteComponentProps {
  defaultState: object;
  location: Location;
  history: History;
}

const createRoute = (htmlRoutesConfig: object, defaultState: object) => {
  const clientRoutes: Array<ReactElement> = Object.entries(
    htmlRoutesConfig
  ).map(([key, { component, url }]: [string, Interfaces.Route]) => {
    const ComponentToRender = Pages[component];

    return (
      <Route
        key={key}
        exact
        path={url}
        render={() => (
          <ComponentToRender defaultState={defaultState} />
        )}></Route>
    );
  });
  return clientRoutes;
};

const Routes: React.FC<Props> = ({ defaultState, location, history }) => {
  const [clientRoutes, setClientRoutes] = useState<Array<ReactElement>>(
    createRoute(siteConfig.server.htmlRoutes, defaultState)
  );
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // clientRoutes;
  }, [location.pathname]);

  return mounted ? (
    <Switch>
      {clientRoutes}
      <Route path="/not-found" component={Pages.Home} />
      <Route path="*">
        <Redirect to="/not-found" />
      </Route>
    </Switch>
  ) : (
    <div></div>
  );
};

export default withRouter(Routes);
