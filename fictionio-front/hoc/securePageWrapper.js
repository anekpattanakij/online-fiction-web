import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'next/router';

export default WrappedComponent => {
  class VerifyAuth extends React.Component {
    static async getInitialProps() {
      return WrappedComponent.getInitialProps();
    }

    componentWillReceiveProps(nextProps) {
      if ((nextProps.rehydrated && !this.props.rehydrated) || this.props.rehydrated) {
        if (nextProps.isSessionTimeout && this.props.router.pathname.indexOf('login') < 0) {
          this.props.router.push('/login');
        } else if (!nextProps.loggedOnUser || !nextProps.loggedOnUser.cif) {
          this.props.router.push('/no-authorized');
        }
      }
    }

    render() {
      return <WrappedComponent {...this.props} {...this.state} />;
    }
  }

  const stateToProps = ({ user, _persist }) => ({
    loggedOnUser: user.user,
    isSessionTimeout: user.isSessionTimeout,
    rehydrated: _persist.rehydrated,
  });

  const dispatchToProps = {};

  VerifyAuth.propTypes = {
    loggedOnUser: PropTypes.object,
    router: PropTypes.object,
    isSessionTimeout: PropTypes.bool,
    rehydrated: PropTypes.bool,
  };

  return connect(
    stateToProps,
    dispatchToProps,
  )(withRouter(VerifyAuth));
};
