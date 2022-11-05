/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { Suspense, useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useLocation
} from 'react-router-dom';
import { bindActionCreators } from 'redux';
import ErrorBoundary from 'src/components/ErrorBoundary';
import Loading from 'src/components/Loading';
import ToastContainer from 'src/components/MessageToasts/ToastContainer';
import { GlobalStyles } from 'src/GlobalStyles';
import { logEvent } from 'src/logger/actions';
import { Logger, LOG_ACTIONS_SPA_NAVIGATION } from 'src/logger/LogUtils';
import { bootstrapData } from 'src/preamble';
import setupApp from 'src/setup/setupApp';
import setupExtensions from 'src/setup/setupExtensions';
import setupPlugins from 'src/setup/setupPlugins';
import Menu from 'src/views/components/Menu';
import { isFrontendRoute, routes } from 'src/views/routes';
import { store } from 'src/views/store';
import QueryProvider from './QueryProvider';
import { RootContextProviders } from './RootContextProviders';
import { ScrollToTop } from './ScrollToTop';

React;

setupApp();
setupPlugins();
setupExtensions();

const user = { ...bootstrapData.user };
const menu = {
  ...bootstrapData.common.menu_data,
};
let lastLocationPathname: string;

const boundActions = bindActionCreators({ logEvent }, store.dispatch);

const LocationPathnameLogger = () => {
  const location = useLocation();
  useEffect(() => {
    // This will log client side route changes for single page app user navigation
    boundActions.logEvent(LOG_ACTIONS_SPA_NAVIGATION, {
      path: location.pathname,
    });
    // reset performance logger timer start point to avoid soft navigation
    // cause dashboard perf measurement problem
    if (lastLocationPathname && lastLocationPathname !== location.pathname) {
      Logger.markTimeOrigin();
    }
    lastLocationPathname = location.pathname;
  }, [location.pathname]);
  return <></>;
};

const App = () => (
  <QueryProvider>
    <Router>
      <ScrollToTop />
      <LocationPathnameLogger />
      <RootContextProviders>
        <GlobalStyles />
        <Menu data={menu} isFrontendRoute={isFrontendRoute} />
        <Switch>
          {routes.map(({ path, Component, props = {}, Fallback = Loading }) => (
            <Route path={path} key={path}>
              <Suspense fallback={<Fallback />}>
                <ErrorBoundary>
                  <Component user={user} {...props} />
                </ErrorBoundary>
              </Suspense>
            </Route>
          ))}
        </Switch>
        <ToastContainer />
      </RootContextProviders>
    </Router>
  </QueryProvider>
);

export default hot(App);
