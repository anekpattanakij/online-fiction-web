import React from 'react';
import { withTranslation } from '../i18n';
import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import SignUpForm from '../components/formComponents/SignUpForm';
import { resetCurrentUserAction, signup } from '../redux-saga/action/userAction';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import '../static/css/blank.css';

class Signup extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['signup'],
    };
  }

  render() {
    const { t } = this.props;
    if (this.props.currentUser && this.props.currentUser.logonStatus) {
      this.props.router.push('/index');
    }
    return (
      <React.Fragment>
          <Helmet title={t('signup:title-signup')} />
          <SignUpForm {...this.props} />
      </React.Fragment>
    );
  }
}

Signup.propTypes = {
  t: PropTypes.func.isRequired,
  signup: PropTypes.func,
  resetCurrentUserAction: PropTypes.func,
  errorList: PropTypes.array,
  currentUser: PropTypes.object,
  router: PropTypes.object,
  loading: PropTypes.bool,
};

const stateToProps = ({ user }) => ({
  currentUser: user.user,
  errorList: user.errorList,
  loading: user.loading,
});
const dispatchToProps = {
  signup,
  resetCurrentUserAction,
};

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation('signup')(Signup)));
