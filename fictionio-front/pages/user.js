import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
// import CoinIcon from '../components/CoinIcon';
import Loading from '../components/Loading';
import { preventNaNNumber } from '../util/converterUtil';
import { connect } from 'react-redux';
import { withTranslation, Link } from '../i18n';
import { withRouter } from 'next/router';
import * as moment from 'moment';
import Config from '../config/index';
import { API_CALLING_METHOD, callNonSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../common/ApiPortal';
import ReactSVG from 'react-svg';
import { generateStaticPath, generateCoverPath } from '../util/staticPathUtil';
import Fiction from '../common/Fiction';

class UserPage extends React.Component {
  state = {
    settingTab: 'fiction',
    loadingTranslateFiction: false,
    translateFictionList: null,
    translateFictionLoadingFail: false,
  };

  // eslint-disable-next-line no-unused-vars
  static async getInitialProps({ req, query: { user } }) {
    let targetUser = null;
    let writeFictionList = null;

    await callNonSecureApi(Config.apiPath + '/user/' + user, API_CALLING_METHOD.GET).then(userResponse => {
      if (userResponse.result === RETURN_CODE_API_CALL_SUCCESS && userResponse.data) {
        targetUser = userResponse.data.result;
      }
    });
    if (targetUser) {
      await callNonSecureApi(Config.apiPath + '/user/' + user + '/fiction', API_CALLING_METHOD.GET).then(fictionResponse => {
        if (fictionResponse.result === RETURN_CODE_API_CALL_SUCCESS && fictionResponse.data) {
          writeFictionList = fictionResponse.data.result;
        }
      });
    }
    return {
      targetUser: targetUser,
      writeFictionList: writeFictionList,
      namespacesRequired: ['common', 'user'],
    };
  }

  constructor(props) {
    super(props);
    this.switchSettingTab = this.switchSettingTab.bind(this);
  }

  componentDidMount() {}

  switchSettingTab = targetTab => {
    if (targetTab === 'translateFiction') {
      // load translate fiction
      this.setState({ loadingTranslateFiction: true });
      callNonSecureApi(Config.apiPath + '/user/' + this.props.router.query.user + '/translate', API_CALLING_METHOD.GET).then(
        fictionResponse => {
          if (fictionResponse.result === RETURN_CODE_API_CALL_SUCCESS && fictionResponse.data) {
            this.setState({ translateFictionList: fictionResponse.data.result, loadingTranslateFiction: false });
          } else {
            this.setState({ translateFictionLoadingFail: true, loadingTranslateFiction: false });
          }
        },
      );
    }
    this.setState({ settingTab: targetTab });
  };

  render() {
    const { t } = this.props;
    return (
      <div className="container" role="main" id="content">
        {!this.props.targetUser ? (
          <div className="alert alert-danger text-center mt-2" role="alert">
            <strong>{t('user:ERROR_USER_NOT_FOUND')}</strong>
          </div>
        ) : (
          <React.Fragment>
            <Helmet title={this.props.targetUser ? this.props.targetUser.displayName + t('user:title') : t('user:title')} />
            <ul className="nav nav-tabs mb-3 " role="tablist">
              <li className="nav-item active show">
                <span className="fas fa-home fa-fw " title="Dashboard" />{' '}
                <span className="d-none d-md-inline">{t('user:dashboard')}</span>
              </li>
            </ul>
            <div className="tab-content">
              <div role="tabpanel" className="tab-pane fade active show" id="dashboard">
                <div className="container">
                  <div className="card mb-3">
                    <h6 className="card-header d-flex align-items-center py-2">
                      <span className="fas fa-user fa-fw " />{' '}
                      <span className="mx-1">{this.props.targetUser && this.props.targetUser.displayName}</span>
                    </h6>
                    <div className="card-body p-0">
                      <div className="row edit">
                        <div className="col-xl-1 col-lg-1 col-md-2" />
                        <div className="col-xl-10 col-lg-10 col-md-8">
                          <div className="row m-0 py-1 px-0 border-top">
                            <div className="col-lg-3 col-xl-4 strong">{t('user:joined')}:</div>
                            <div className="col-lg-9 col-xl-8">
                              <span className="fas fa-calendar-alt fa-fw " />{' '}
                              {this.props.targetUser && moment(this.props.targetUser.registerDate).format('MMM Do YY')}
                            </div>
                          </div>
                          <div className="row m-0 py-1 px-0 border-top">
                            <div className="col-lg-3 col-xl-4 strong">{t('user:last-login')}:</div>
                            <div className="col-lg-9 col-xl-8">
                              <span className="fas fa-clock fa-fw " />{' '}
                              {this.props.targetUser && moment(this.props.targetUser.lastLoginDate).format('MMM Do YY')}
                            </div>
                          </div>

                          <div className="row m-0 py-1 px-0 border-top">
                            <div className="col-lg-3 col-xl-4 strong">{t('user:published-fiction')}:</div>
                            <div className="col-lg-9 col-xl-8">
                              <span className="fas fa-book fa-fw " />{' '}
                              {preventNaNNumber(this.props.targetUser && this.props.targetUser.publishedFictionCount)}
                            </div>
                          </div>
                          <div className="row m-0 py-1 px-0 border-top">
                            <div className="col-lg-3 col-xl-4 strong">{t('user:published-chapter')}:</div>
                            <div className="col-lg-9 col-xl-8">
                              <span className="fas fa-file-alt fa-fw " />{' '}
                              {preventNaNNumber(this.props.targetUser && this.props.targetUser.publishedChapterCount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ul className="nav nav-tabs mb-3 " role="tablist">
              <li className={this.state.settingTab === 'fiction' ? 'nav-item active show' : 'nav-item'}>
                <a
                  className="nav-link"
                  data-toggle="tab"
                  onClick={e => {
                    e.preventDefault();
                    this.switchSettingTab('fiction');
                  }}
                >
                  <span className="fas fa-pencil-alt fa-fw " title="Write Fiction" />{' '}
                  <span className=" d-lg-inline">{t('user:write-fiction')}</span>
                </a>
              </li>
              <li className={this.state.settingTab === 'translateFiction' ? 'nav-item active show' : 'nav-item'}>
                <a
                  className="nav-link "
                  data-toggle="tab"
                  onClick={e => {
                    e.preventDefault();
                    this.switchSettingTab('translateFiction');
                  }}
                >
                  <span className="fas fa-language fa-fw " title="Translated Fiction" />{' '}
                  <span className="d-lg-inline">{t('user:translate-fiction')}</span>
                </a>
              </li>
            </ul>
            <div className="tab-content">
              <div id="write_list" className={this.state.settingTab === 'fiction' ? 'tab-pane fade active show' : 'tab-pane fade'}>
                <div className="row mt-1 mx-0">
                  {this.props.writeFictionList &&
                    this.props.writeFictionList.map((fictionItem, itemIndex) => (
                      <div className="col-lg-6 border-bottom pl-0 my-1" key={'fiction-' + itemIndex}>
                        <div className="rounded mr-2 float-left">
                          <Link href={'/fiction?fiction=' + fictionItem.fictionId} as={'/fiction/' + fictionItem.fictionId}>
                            <a>
                              {fictionItem && fictionItem.cover && typeof fictionItem.cover === 'string' ? (
                                <img
                                  className="rounded"
                                  src={generateCoverPath(fictionItem.cover)}
                                  style={{ height: '170px', width: '120px' }}
                                  alt="image"
                                />
                              ) : (
                                <div className="noCover" width="100%">
                                  <ReactSVG
                                    src={generateStaticPath('/img/fictionio-cover.svg')}
                                    beforeInjection={svg => {
                                      svg.setAttribute('style', 'height:170px;width:120px');
                                    }}
                                    wrapper="div"
                                    className="rounded max-width"
                                  />
                                </div>
                              )}
                            </a>
                          </Link>
                        </div>
                        <div className="text-truncate mb-1 d-flex flex-nowrap align-items-center" style={{ display: 'inline' }}>
                          <div>
                            <ReactSVG
                              className="flag-icon pl-1"
                              src={generateStaticPath('/img/flag/' + ('' + fictionItem.originalFictionLanguage).toLowerCase() + '.svg')}
                            />
                          </div>{' '}
                          <Link href={'/fiction?fiction=' + fictionItem.fictionId} as={'/fiction/' + fictionItem.fictionId}>
                            <a
                              className="ml-1 text-truncate"
                              title={Fiction.displayFictionName(fictionItem, this.props.i18n.language)}
                              style={{ fontWeight: '700' }}
                            >
                              {Fiction.displayFictionName(fictionItem, this.props.i18n.language)}
                            </a>
                          </Link>
                        </div>
                        <ul className="list-inline m-1">
                          <li className="list-inline-item text-primary">
                            <span className="fas fa-star fa-fw " title="rating"></span> (
                            <span>{fictionItem.rating ? fictionItem.rating.toFixed(2) : '0.00'}</span>)
                          </li>
                          <li className="list-inline-item text-success">
                            <span className="fas fa-bookmark fa-fw " title="numberOfChapter"></span> {fictionItem.numberOfChapter}
                          </li>
                        </ul>
                        <div style={{ height: '140px', overflow: 'hidden' }}>
                          {Fiction.displayShortDetail(fictionItem, this.props.i18n.language)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div
                id="translate_list"
                className={this.state.settingTab === 'translateFiction' ? 'tab-pane fade active show' : 'tab-pane fade'}
              >
                <Loading loading={this.state.loadingTranslateFiction} t={t} />
                <div className="row mt-1 mx-0">
                  {this.state.translateFictionList &&
                    this.state.translateFictionList.map((fictionItem, itemIndex) => (
                      <div className="col-lg-6 border-bottom pl-0 my-1" key={'fiction-' + itemIndex}>
                        <div className="rounded mr-2 float-left">
                          <Link href={'/fiction?fiction=' + fictionItem.fictionId} as={'/fiction/' + fictionItem.fictionId}>
                            <a>
                              {fictionItem && fictionItem.cover && typeof fictionItem.cover === 'string' ? (
                                <img
                                  className="rounded"
                                  src={generateCoverPath(fictionItem.cover)}
                                  style={{ height: '170px', width: '120px' }}
                                  alt="image"
                                />
                              ) : (
                                <div className="noCover" width="100%">
                                  <ReactSVG
                                    src={generateStaticPath('/img/fictionio-cover.svg')}
                                    beforeInjection={svg => {
                                      svg.setAttribute('style', 'height:170px;width:120px');
                                    }}
                                    wrapper="div"
                                    className="rounded max-width"
                                  />
                                </div>
                              )}
                            </a>
                          </Link>
                        </div>
                        <div className="text-truncate mb-1 d-flex flex-nowrap align-items-center" style={{ display: 'inline' }}>
                          <div>
                            <ReactSVG
                              className="flag-icon pl-1"
                              src={generateStaticPath('/img/flag/' + ('' + fictionItem.originalFictionLanguage).toLowerCase() + '.svg')}
                            />
                          </div>{' '}
                          <Link href={'/fiction?fiction=' + fictionItem.fictionId} as={'/fiction/' + fictionItem.fictionId}>
                            <a
                              className="ml-1 text-truncate"
                              title={Fiction.displayFictionName(fictionItem, this.props.i18n.language)}
                              style={{ fontWeight: '700' }}
                            >
                              {Fiction.displayFictionName(fictionItem, this.props.i18n.language)}
                            </a>
                          </Link>
                        </div>
                        <ul className="list-inline m-1">
                          <li className="list-inline-item text-primary">
                            <span className="fas fa-star fa-fw " title="rating"></span> (
                            <span>{fictionItem.rating ? fictionItem.rating.toFixed(2) : '0.00'}</span>)
                          </li>
                          <li className="list-inline-item text-success">
                            <span className="fas fa-file-alt fa-fw " title="numberOfChapter"></span> {fictionItem.numberOfChapter}
                          </li>
                        </ul>
                        <div style={{ height: '140px', overflow: 'hidden' }}>
                          {Fiction.displayShortDetail(fictionItem, this.props.i18n.language)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }
}

UserPage.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
  targetUser: PropTypes.object,
  writeFictionList: PropTypes.array,
  i18n: PropTypes.object,
};

const stateToProps = () => ({});

const dispatchToProps = {};

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation(['user'])(UserPage)));
