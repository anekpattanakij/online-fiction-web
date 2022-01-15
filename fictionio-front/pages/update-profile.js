import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { withTranslation } from '../i18n';
import UpdateProfileForm from '../components/formComponents/UpdateProfileForm';
import ChangePasswordForm from '../components/formComponents/ChangePasswordForm';
import ProfileFictionArea from '../components/ProfileFictionArea';
import ProfileChapterArea from '../components/ProfileChapterArea';
import { connect } from 'react-redux';
import * as moment from 'moment';
import { preventNaNNumber } from '../util/converterUtil';
import { sessionTimeout, updateAccessToken, updateProfile, resetCurrentUserAction, changePassword } from '../redux-saga/action/userAction';
import { API_CALLING_METHOD, callSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../common/ApiPortal';
import Config from '../config/index';
import securePageWrapper from '../hoc/securePageWrapper';

class UpdateProfile extends React.Component {
  state = {
    settingTab: 'dashboard',
    settingDashboardTab: 'chapter',
    loadingFiction: false,
    loadingChapter: false,
    chapterList: null,
    fictionList: null,
    fictionLoadingFail: false,
    chapterLoadingFail: false,
  };

  constructor(props) {
    super(props);
    this.switchSettingTab = this.switchSettingTab.bind(this);
  }

  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'language-list', 'update-profile'],
    };
  }

  switchSettingTab = (targetTab, tabSection) => {
    if (targetTab === 'fiction') {
      this.setState({ loadingFiction: true });
      callSecureApi(
        this.props.sessionTimeout,
        this.props.updateAccessToken,
        this.props.currentUser,
        Config.apiPath + '/user/fiction',
        API_CALLING_METHOD.GET,
      ).then(fictionResponse => {
        if (fictionResponse.result === RETURN_CODE_API_CALL_SUCCESS && fictionResponse.data) {
          this.setState({ fictionList: fictionResponse.data.result, loadingFiction: false });
        } else {
          this.setState({ fictionLoadingFail: true, loadingFiction: false });
        }
      });
    }

    if (tabSection === 'dashboard') {
      this.props.resetCurrentUserAction();
      this.setState({ settingDashboardTab: targetTab });
    } else {
      this.setState({ settingTab: targetTab });
    }
  };

  componentDidUpdate() {
    // get chapter after rehydrate becuase need current user information
    if (this.props.rehydrated && this.state.chapterList === null && !this.state.loadingChapter && !this.state.chapterLoadingFail) {
      this.setState({ loadingChapter: true });
      callSecureApi(
        this.props.sessionTimeout,
        this.props.updateAccessToken,
        this.props.currentUser,
        Config.apiPath + '/user/chapter',
        API_CALLING_METHOD.GET,
      ).then(chapterResponse => {
        if (chapterResponse.result === RETURN_CODE_API_CALL_SUCCESS && chapterResponse.data && chapterResponse.data.result) {
          this.setState({ chapterList: chapterResponse.data.result, loadingChapter: false });
        } else {
          this.setState({ chapterLoadingFail: true, loadingChapter: false });
        }
      });
    }

    return null;
  }

  componentDidMount() {
    this.props.resetCurrentUserAction();
  }

  render() {
    const { t } = this.props;
    return (
      <React.Fragment>
        <Helmet title={t('update-profile:update-profile-header')} />
        <ul className="nav nav-tabs mb-3 " role="tablist">
          <li className={this.state.settingTab === 'dashboard' ? 'nav-item active show' : 'nav-item'}>
            <a
              className="nav-link"
              data-toggle="tab"
              onClick={e => {
                e.preventDefault();
                this.switchSettingTab('dashboard');
              }}
            >
              <span className="fas fa-home fa-fw " title="Dashboard" />{' '}
              <span className="d-none d-md-inline">{t('update-profile:dashboard')}</span>
            </a>
          </li>
          <li className="nav-item">
            <a
              className="nav-link "
              data-toggle="tab"
              onClick={e => {
                e.preventDefault();
                this.switchSettingTab('change-profile');
              }}
            >
              <span className="fas fa-user fa-fw " title="Change profile" />{' '}
              <span className="d-none d-md-inline">{t('update-profile:change-profile')}</span>
            </a>
          </li>
          <li className="nav-item">
            <a
              className="nav-link"
              data-toggle="tab"
              onClick={e => {
                e.preventDefault();
                this.switchSettingTab('change-password');
              }}
            >
              <span className="fas fa-key fa-fw " title="Password and security" />{' '}
              <span className="d-none d-md-inline">{t('update-profile:password-security')}</span>
            </a>
          </li>
        </ul>
        <div className="tab-content">
          <div
            role="tabpanel"
            className={this.state.settingTab === 'dashboard' ? 'tab-pane fade active show' : 'tab-pane fade'}
            id="dashboard"
          >
            <div className="container">
              <div className="card mb-3">
                <h6 className="card-header d-flex align-items-center py-2">
                  <span className="fas fa-user fa-fw " />{' '}
                  <span className="mx-1">{this.props.currentUser && this.props.currentUser.displayName}</span>
                </h6>
                <div className="card-body p-0">
                  <div className="row edit">
                    <div className="col-xl-1 col-lg-1 col-md-2" />
                    <div className="col-xl-10 col-lg-10 col-md-8">
                      <div className="row m-0 py-1 px-0">
                        <div className="col-lg-3 col-xl-4 strong">{t('update-profile:e-mail')}:</div>
                        <div className="col-lg-9 col-xl-8">
                          <span className="fas fa-envelope fa-fw " /> {this.props.currentUser && this.props.currentUser.email}
                        </div>
                      </div>
                      <div className="row m-0 py-1 px-0 border-top">
                        <div className="col-lg-3 col-xl-4 strong">{t('update-profile:coin')}:</div>
                        <div className="col-lg-9 col-xl-8">
                          <span className="fas fa-coins fa-fw " /> {this.props.currentUser && this.props.currentUser.coin}
                        </div>
                      </div>
                      <div className="row m-0 py-1 px-0 border-top">
                        <div className="col-lg-3 col-xl-4 strong">{t('update-profile:joined')}:</div>
                        <div className="col-lg-9 col-xl-8">
                          <span className="fas fa-calendar-alt fa-fw " />{' '}
                          {this.props.currentUser && moment(this.props.currentUser.registerDate).format('MMM Do YY')}
                        </div>
                      </div>
                      <div className="row m-0 py-1 px-0 border-top">
                        <div className="col-lg-3 col-xl-4 strong">{t('update-profile:published-fiction')}:</div>
                        <div className="col-lg-9 col-xl-8">
                          <span className="fas fa-book fa-fw " />{' '}
                          {preventNaNNumber(this.props.currentUser && this.props.currentUser.publishedFictionCount)}
                        </div>
                      </div>
                      <div className="row m-0 py-1 px-0 border-top">
                        <div className="col-lg-3 col-xl-4 strong">{t('update-profile:published-chapter')}:</div>
                        <div className="col-lg-9 col-xl-8">
                          <span className="fas fa-file-alt fa-fw " />{' '}
                          {preventNaNNumber(this.props.currentUser && this.props.currentUser.publishedChapterCount)}
                        </div>
                      </div>
                      <div className="row m-0 py-1 px-0 border-top">
                        <div className="col-lg-3 col-xl-4 strong">{t('update-profile:income-author')}:</div>
                        <div className="col-lg-9 col-xl-8">
                          <span className="fas fa-money-bill-wave fa-fw " />{' '}
                          {preventNaNNumber(this.props.currentUser && this.props.currentUser.totalIncomeAsAuthor)}
                        </div>
                      </div>
                      <div className="row m-0 py-1 px-0 border-top">
                        <div className="col-lg-3 col-xl-4 strong">{t('update-profile:income-translated')}:</div>
                        <div className="col-lg-9 col-xl-8">
                          <span className="fas fa-money-bill-wave fa-fw " />{' '}
                          {preventNaNNumber(this.props.currentUser && this.props.currentUser.totalIncomeFromTranslated)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="nav nav-tabs mb-3 " role="tablist">
                <li className={this.state.settingDashboardTab === 'chapter' ? 'nav-item active show' : 'nav-item'}>
                  <a
                    className="nav-link"
                    data-toggle="tab"
                    onClick={e => {
                      e.preventDefault();
                      this.switchSettingTab('chapter', 'dashboard');
                    }}
                  >
                    <span className="fas fa-home fa-fw " title="Site settings" />{' '}
                    <span className=" d-lg-inline">{t('update-profile:chapter-tab')}</span>
                  </a>
                </li>
                <li className={this.state.settingDashboardTab === 'fiction' ? 'nav-item active show' : 'nav-item'}>
                  <a
                    className="nav-link "
                    data-toggle="tab"
                    onClick={e => {
                      e.preventDefault();
                      this.switchSettingTab('fiction', 'dashboard');
                    }}
                  >
                    <span className="fas fa-user fa-fw " title="Password and Security" />{' '}
                    <span className="d-lg-inline">{t('update-profile:fiction-tab')}</span>
                  </a>
                </li>
              </ul>
              <div className="tab-content">
                <div
                  id="chapter_list"
                  className={this.state.settingDashboardTab === 'chapter' ? 'tab-pane fade active show' : 'tab-pane fade'}
                >
                  <ProfileChapterArea
                    chapterLoading={this.state.loadingChapter}
                    chapterLoadFail={this.state.chapterLoadingFail}
                    chapterList={this.state.chapterList}
                    t={t}
                  />
                </div>
                <div
                  id="fiction_list"
                  className={this.state.settingDashboardTab === 'fiction' ? 'tab-pane fade active show' : 'tab-pane fade'}
                >
                  <ProfileFictionArea
                    fictionLoading={this.state.loadingFiction}
                    fictionLoadFail={this.state.fictionLoadingFail}
                    fictionList={this.state.fictionList}
                    t={t}
                    lng={this.props.i18n.language}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            role="tabpanel"
            className={this.state.settingTab === 'change-profile' ? 'tab-pane fade active show' : 'tab-pane fade'}
            id="change_profile"
          >
            <div className="container">
              <UpdateProfileForm
                user={this.props.currentUser}
                t={t}
                sessionTimeout={this.props.sessionTimeout}
                updateAccessToken={this.props.updateAccessToken}
                updateProfile={this.props.updateProfile}
                errorList={this.props.updateProfileErrorList}
                result={this.props.updateProfileResult}
                loading={this.props.loading}
              />
            </div>
          </div>
          <div
            role="tabpanel"
            className={this.state.settingTab === 'change-password' ? 'tab-pane fade active show' : 'tab-pane fade'}
            id="change_password"
          >
            <div className="container">
              <ChangePasswordForm {...this.props} loading={this.props.loading} />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

UpdateProfile.propTypes = {
  t: PropTypes.func.isRequired,
  updateProfileErrorList: PropTypes.array,
  changePasswordErrorList: PropTypes.array,
  currentUser: PropTypes.object,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  updateProfile: PropTypes.func,
  updateProfileResult: PropTypes.bool,
  changePasswordResult: PropTypes.bool,
  rehydrated: PropTypes.bool,
  resetCurrentUserAction: PropTypes.func,
  i18n: PropTypes.object,
  changePassword: PropTypes.func,
  loading: PropTypes.bool,
};

const stateToProps = ({ user, _persist }) => ({
  currentUser: user.user,
  updateProfileErrorList: user.updateProfileErrorList,
  changePasswordErrorList: user.changePasswordErrorList,
  updateProfileResult: user.updateProfileSuccess,
  changePasswordResult: user.changePasswordSuccess,
  rehydrated: _persist.rehydrated,
  loading: user.loading,
});

const dispatchToProps = { sessionTimeout, updateAccessToken, updateProfile, resetCurrentUserAction, changePassword };

export default connect(
  stateToProps,
  dispatchToProps,
)(securePageWrapper(withTranslation(['common', 'language-list', 'update-profile'])(UpdateProfile)));
