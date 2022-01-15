import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { withTranslation } from '../i18n';
import ResetPasswordForm from '../components/formComponents/ResetPasswordForm';
import { withRouter } from 'next/router';
import { connect } from 'react-redux';
import { resetCurrentUserAction, resetPassword } from '../redux-saga/action/userAction';
import '../static/css/blank.css';

class ResetPassword extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'reset-password'],
    };
  }

  componentDidMount() {
    this.props.resetCurrentUserAction();
  }

  render() {
    const { t } = this.props;
    if (this.props.currentUser && this.props.currentUser.logonStatus) {
      this.props.router.push('/index');
    }
    return (
      <React.Fragment>
        <Helmet title={t('reset-password:reset-password-title')} />
        <ResetPasswordForm {...this.props} lng={this.props.i18n.language} result={this.props.currentActionSuccess} />
      </React.Fragment>
    );
  }
}

ResetPassword.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
  currentUser: PropTypes.object,
  errorList: PropTypes.array,
  i18n: PropTypes.object,
  currentActionSuccess: PropTypes.bool,
  resetCurrentUserAction: PropTypes.func,
  resetPassword: PropTypes.func,
  loading: PropTypes.bool,

};

const stateToProps = ({ user }) => ({
  currentUser: user.user,
  errorList: user.errorList,
  currentActionSuccess: user.currentActionSuccess,
  loading : user.loading,
});
const dispatchToProps = { resetCurrentUserAction, resetPassword };

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation('reset-password')(ResetPassword)));
