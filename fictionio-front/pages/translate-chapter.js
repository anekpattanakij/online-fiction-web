import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withTranslation, Link } from '../i18n';
import { withRouter } from 'next/router';

import TranslateChapterForm from '../components/formComponents/TranslateChapterForm';
import { loadChapter, saveTranslateChapter } from '../redux-saga/action/chapterAction';
import { sessionTimeout, updateAccessToken } from '../redux-saga/action/userAction';
import SecurePageWrapper from '../hoc/securePageWrapper';
import { ERROR_CODE_FICTION_NOT_EXIST, ERROR_CODE_NETWORK_ERROR } from '../common/Error';
import { API_CALLING_METHOD, callNonSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../common/ApiPortal';
import { API_FICTION_URL } from '../redux-saga/saga/fictionSaga';
import Loading from '../components/Loading';
import Config from '../config';
import '../static/css/blank.css';

class TranslateChapter extends React.Component {
  state = {
    originalFiction: null,
    originalFictionLoading: false,
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.rehydrated) {
      if (!this.props.currentChapter || this.props.currentChapter.chapterId !== this.props.router.query['translate-chapter']) {
        this.props.loadChapter(
          this.props.router.query['translate-chapter'],
          this.props.sessionTimeout,
          this.props.updateAccessToken,
          this.props.currentUser,
        );
      } else {
        this.loadOriginalFiction(this.props.currentChapter.fictionId);
      }
    }
  }

  componentDidUpdate() {
    if (this.props.rehydrated) {
      if (
        (!this.props.currentChapter && !this.props.chapterLoading) ||
        (this.props.currentChapter &&
          this.props.currentChapter.chapterId !== this.props.router.query['translate-chapter'] &&
          !this.props.chapterLoading)
      ) {
        this.props.loadChapter(
          this.props.router.query['translate-chapter'],
          this.props.sessionTimeout,
          this.props.updateAccessToken,
          this.props.currentUser,
        );
      }
    }
    if (
      this.props.currentChapter &&
      this.props.currentChapter.fictionId &&
      !this.state.originalFiction &&
      !this.state.originalFictionLoading
    ) {
      this.loadOriginalFiction(this.props.currentChapter.fictionId);
    }
  }

  loadOriginalFiction = async fictionId => {
    try {
      this.setState({ originalFictionLoading: true });
      let response = await callNonSecureApi(API_FICTION_URL + '/' + fictionId, API_CALLING_METHOD.GET);

      if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
        this.setState({ originalFiction: response.data, originalFictionLoading: false });
      } else {
        throw response;
      }
    } catch (err) {
      // do nothing
    }
  };

  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'translate-chapter', 'language-list'],
    };
  }

  render() {
    const { t, chapterErrorList, saveOrEditChapterResult } = this.props;
    let networkError = false;
    if (chapterErrorList && chapterErrorList.length > 0) {
      chapterErrorList.map(errorItem => {
        if (errorItem && errorItem.code && errorItem.code === ERROR_CODE_FICTION_NOT_EXIST) {
          this.props.router.push('/content-not-found');
        }
        if (errorItem && errorItem.code && errorItem.code === ERROR_CODE_NETWORK_ERROR) {
          networkError = true;
        }
      });
    }

    return (
      <div className="container" role="main" id="content">
        {networkError ? (
          <div className="alert alert-danger text-center mt-2" role="alert">
            <strong>{t('common:error.ERROR_CODE_DATABASE_CONNECTION')}</strong>
          </div>
        ) : (
          <React.Fragment>
            <Helmet
              title={
                t('translate-chapter:chapter-translate-title') +
                ' - ' +
                (this.props.currentChapter && this.props.currentChapter.chapterName)
              }
            />
            {saveOrEditChapterResult !== '' ? (
              <div className="alert alert-success text-center mt-2" role="alert">
                <strong>
                  <Link
                    href={'/chapter?chapter=' + ('' + (saveOrEditChapterResult && saveOrEditChapterResult.chapterId))}
                    as={'/chapter/' + ('' + (saveOrEditChapterResult && saveOrEditChapterResult.chapterId))}
                  >
                    <a>
                      {this.props.t('translate-chapter:chapter-translate-success', {
                        chaptername:
                          saveOrEditChapterResult && saveOrEditChapterResult.chapterName ? saveOrEditChapterResult.chapterName : '',
                      })}
                    </a>
                  </Link>
                </strong>
              </div>
            ) : this.props.chapterErrorList && Array.isArray(chapterErrorList) && chapterErrorList.length > 0 ? (
              <div className="alert alert-danger text-center mt-2" role="alert">
                <strong>{this.props.t('common:error.' + chapterErrorList[0].code)}</strong>
              </div>
            ) : !this.state.originalFiction ? (
              <Loading loading={!this.state.originalFiction} t={t} />
            ) : Config.i18n.whitelist.length ===
              new Set([this.state.originalFiction.originalFictionLanguage, this.props.currentChapter.language]).size ? (
              <div className="alert alert-danger text-center mt-2" role="alert">
                <strong>{t('translate-chapter:not-allow-to-translate')}</strong>
              </div>
            ) : (
              <div className="card my-3">
                <h6 className="card-header">
                  <span className="fas fa-plus-circle fa-fw " /> {t('translate-chapter:chapter-translate-header')}
                </h6>
                <TranslateChapterForm {...this.props} originalFiction={this.state.originalFiction} />
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

TranslateChapter.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
  saveTranslateChapter: PropTypes.func.isRequired,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  loadChapter: PropTypes.func,
  currentUser: PropTypes.object,
  chapterErrorList: PropTypes.array,
  chapterLoading: PropTypes.bool,
  currentChapter: PropTypes.object,
  saveOrEditChapterResult: PropTypes.string,
  rehydrated: PropTypes.bool,
};

const stateToProps = ({ user, chapter, _persist }) => ({
  currentUser: user.user,
  chapterErrorList: chapter.errorList,
  chapterLoading: chapter.loading,
  currentChapter: chapter.currentChapter,
  saveOrEditChapterResult: chapter.saveOrEditChapterResult,
  rehydrated: _persist.rehydrated,
});
const dispatchToProps = {
  saveTranslateChapter,
  sessionTimeout,
  updateAccessToken,
  loadChapter,
};

TranslateChapter.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
};

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation(['translate-chapter', 'language-list'])(withRouter(SecurePageWrapper(TranslateChapter)))));
