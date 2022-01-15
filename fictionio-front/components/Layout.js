import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Header from './Header';
import Footer from './Footer';
import Annoucement from './Annoucement';
import SideMenu from './modalComponents/SideMenu';
import { withRouter } from 'next/router';
import { sessionTimeout, updateAccessToken } from '../redux-saga/action/userAction';
import { API_CALLING_METHOD, callSecureApi } from '../common/ApiPortal';
import Config from '../config/index';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

const EXPECT_HEADER_FOOTER_PATH = ['chapter'];
class Layout extends React.Component {
  state = { checkingTimeout: false };

  static getDerivedStateFromProps(props, state) {
    // get chapter after rehydrate becuase need current user information
    let checked = false;
    if (props.rehydrated && !state.checkingTimeout) {
      checked = true;
      if (props.currentUser && props.currentUser.accessToken) {
        callSecureApi(
          props.sessionTimeout,
          props.updateAccessToken,
          props.currentUser,
          Config.apiPath + '/chapter/check',
          API_CALLING_METHOD.GET,
        );
      }
    }
    return { checkingTimeout: checked };
  }

  render() {
    const { children, router } = this.props;
    return (
      <React.Fragment>
          <Header />
          {EXPECT_HEADER_FOOTER_PATH.indexOf(router.route.slice(1)) < 0 ? (
            <React.Fragment>
            <GoogleReCaptchaProvider reCaptchaKey={Config.googleReCaptchaKey}>
              <div role="space">&nbsp;</div>
              <div className="container mt-5" role="main" id="content">
                <Annoucement />
                {children}
              </div>
              <Footer />
              </GoogleReCaptchaProvider>
            </React.Fragment>
          ) : (
            <div className="container" role="main" id="content" style={{ minWidth: '100%' }}>
              {children}
            </div>
          )}
          <SideMenu />
      </React.Fragment>
    );
  }
}

Layout.propTypes = {
  children: PropTypes.element.isRequired,
  router: PropTypes.object,
  currentUser: PropTypes.object,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  rehydrated: PropTypes.bool,
};

const stateToProps = ({ user, _persist }) => ({
  currentUser: user.user,
  rehydrated: _persist.rehydrated,
});

const dispatchToProps = { sessionTimeout, updateAccessToken };

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(Layout));
