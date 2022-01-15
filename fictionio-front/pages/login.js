import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { withTranslation } from '../i18n';
import LoginForm from '../components/formComponents/LoginForm';
import { resetCurrentUserAction, login, resetSessionTimeout } from '../redux-saga/action/userAction';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import '../static/css/blank.css';

class Login extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'login'],
    };
  }
  componentDidMount() {
    this.props.resetSessionTimeout();
  }

  componentDidUpdate() {
    if (this.props.currentUser && this.props.currentUser.logonStatus) {
      this.props.router.push('/index');
    }
  }

  render() {
    const { t } = this.props;
    if (this.props.currentUser && this.props.currentUser.logonStatus) {
      this.props.router.push('/index');
    }
    return (
      <React.Fragment>
          <Helmet title={t('login:title-login')} />
          <LoginForm {...this.props} />
      </React.Fragment>
    );
  }
}

Login.propTypes = {
  t: PropTypes.func.isRequired,
  login: PropTypes.func,
  resetCurrentUserAction: PropTypes.func,
  router: PropTypes.object,
  currentUser: PropTypes.object,
  errorList: PropTypes.array,
  isSessionTimeout: PropTypes.bool,
  resetSessionTimeout: PropTypes.func,
  loading: PropTypes.bool,
};

const stateToProps = ({ user }) => ({
  currentUser: user.user,
  errorList: user.errorList,
  isSessionTimeout: user.isSessionTimeout,
  loading: user.loading,
});
const dispatchToProps = {
  login,
  resetCurrentUserAction,
  resetSessionTimeout,
};

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation(['common', 'login'])(Login)));
