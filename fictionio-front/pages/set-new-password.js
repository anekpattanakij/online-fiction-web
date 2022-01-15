import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { withTranslation } from '../i18n';
import { resetCurrentUserAction, setPasswordFromReset } from '../redux-saga/action/userAction';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import { API_CALLING_METHOD, callNonSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../common/ApiPortal';
import Config from '../config/index';
import SetNewPasswordFromResetForm from '../components/formComponents/SetNewPasswordFromResetForm';
import Loading from '../components/Loading';
import '../static/css/blank.css';

const API_VERFIY_TOKEN_URL = Config.apiPath + '/password/verify';

class SetNewPassword extends React.Component {
  state = {
    verifyingToken: true,
    targetEmail: [],
    firstLoad: true,
  };

  static async getInitialProps({ query }) {
    return {
      query,
      namespacesRequired: ['common', 'set-new-password'],
    };
  }

  componentDidUpdate() {
    if (this.props.currentActionSuccess && this.props.rehydrated && !this.state.firstLoad) {
      this.props.router.push('/login');
    }
    if (this.props.rehydrated && this.state.firstLoad) {
      this.props.resetCurrentUserAction();
      if (this.props.query.resetToken) {
        this.verifyToken(this.props.query.resetToken);
      } else {
        this.props.router.push('/no-authorized');
      }
      this.setState({
        firstLoad: false,
      });
    }
  }

  componentDidMount() {}

  verifyToken = async tokenId => {
    try {
      let response = await callNonSecureApi(
        API_VERFIY_TOKEN_URL,
        API_CALLING_METHOD.POST,
        {},
        {
          resetToken: tokenId,
        },
      );
      if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
        this.setState({ verifyingToken: false, targetEmail: response.data.email });
      } else {
        this.props.router.push('/no-authorized');
      }
    } catch (err) {
      // do nothing
    }
  };

  render() {
    const { t } = this.props;
    return (
      <React.Fragment>
        <Helmet title={t('set-new-password:set-new-password-title')} />
        <div id="set_new_password_container" className="mx-auto form-narrow display-none">
          <Loading loading={this.state.verifyingToken} t={t} />
          {!this.state.verifyingToken ? (
            <SetNewPasswordFromResetForm {...this.props} userEmail={this.state.targetEmail} resetToken={this.props.query.resetToken} />
          ) : (
            ''
          )}
        </div>
      </React.Fragment>
    );
  }
}

SetNewPassword.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
  query: PropTypes.object,
  currentActionSuccess: PropTypes.bool,
  resetCurrentUserAction: PropTypes.func,
  setPasswordFromReset: PropTypes.func,
  loading: PropTypes.bool,
  rehydrated: PropTypes.bool,
};

const stateToProps = ({ user, _persist }) => ({
  errorList: user.errorList,
  currentActionSuccess: user.currentActionSuccess,
  loading: user.loading,
  rehydrated: _persist.rehydrated,
});
const dispatchToProps = {
  setPasswordFromReset,
  resetCurrentUserAction,
};

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation('set-new-password')(SetNewPassword)));
