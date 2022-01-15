import React from 'react';
import App, { Container } from 'next/app';
import { appWithTranslation } from '../i18n';
import Layout from '../components/Layout';
import { Provider } from 'react-redux';
import createSagaStore from '../redux-saga/store';
import { PersistGate as PersistGateClient } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import withReduxSaga from 'next-redux-saga';
import withRedux from 'next-redux-wrapper';
import PropTypes from 'prop-types';
import Config from '../config';
import Router from 'next/router';
import withGA from 'next-ga';

class PersistGateServer extends React.Component {
  render() {
    return this.props.children;
  }
}

PersistGateServer.propTypes = {
  children: PropTypes.object,
};

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const runtime = process.env.RUNTIME;
    let PersistGate = PersistGateServer;
    if (runtime === 'browser') {
      PersistGate = PersistGateClient;
    }
    const { Component, pageProps, store } = this.props;
    const persistor = persistStore(store);
    return (
      <Container>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </PersistGate>
        </Provider>
      </Container>
    );
  }
}

// withRedux(createSagaStore)(withReduxSaga(
export default withGA(Config.googleAnalyticKey, Router)(withRedux(createSagaStore)(withReduxSaga(appWithTranslation(MyApp))));
