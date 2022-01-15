import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withTranslation, Link } from '../i18n';
import { withRouter } from 'next/router';

import EditChapterForm from '../components/formComponents/EditChapterForm';
import { loadChapter, saveUpdateChapter } from '../redux-saga/action/chapterAction';
import { sessionTimeout, updateAccessToken } from '../redux-saga/action/userAction';
import SecurePageWrapper from '../hoc/securePageWrapper';
import { ERROR_CODE_FICTION_NOT_EXIST, ERROR_CODE_NETWORK_ERROR } from '../common/Error';
import '../static/css/blank.css';

class EditChapter extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.rehydrated) {
      if (!this.props.currentChapter || this.props.currentChapter.chapterId !== this.props.router.query['edit-chapter']) {
        this.props.loadChapter(
          this.props.router.query['edit-chapter'],
          this.props.sessionTimeout,
          this.props.updateAccessToken,
          this.props.currentUser,
        );
      }
    }
  }

  componentDidUpdate() {
    if (
      (this.props.rehydrated && !(this.props.currentChapter && this.props.currentChapter.chapterId) && !this.props.chapterLoading) ||
      (this.props.currentChapter &&
        this.props.currentChapter.chapterId &&
        !this.props.chapterLoading &&
        this.props.currentChapter.chapterId !== this.props.router.query['edit-chapter'])
    ) {
      this.props.loadChapter(
        this.props.router.query['edit-chapter'],
        this.props.sessionTimeout,
        this.props.updateAccessToken,
        this.props.currentUser,
      );
    }

    if (this.props.currentChapter && this.props.currentChapter.chapterId) {
      if (this.props.currentChapter.author.cif !== this.props.currentUser.cif) {
        this.props.router.push('/no-authorized');
      }
    }
  }

  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'chapter-new', 'language-list'],
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
              title={t('chapter-new:chapter-edit-title') + ' - ' + (this.props.currentChapter && this.props.currentChapter.chapterName)}
            />
            {saveOrEditChapterResult && saveOrEditChapterResult !== '' ? (
              <div className="alert alert-success text-center mt-2" role="alert">
                <strong>
                  <Link
                    href={'/chapter?chapter=' + ('' + (saveOrEditChapterResult && saveOrEditChapterResult.chapterId))}
                    as={'/chapter/' + ('' + (saveOrEditChapterResult && saveOrEditChapterResult.chapterId))}
                  >
                    <a>
                      {this.props.t('chapter-new:chapter-edit-success', {
                        chaptername:
                          saveOrEditChapterResult && saveOrEditChapterResult.chapterName ? saveOrEditChapterResult.chapterName : '',
                      })}
                    </a>
                  </Link>
                </strong>
              </div>
            ) : !this.props.currentChapter &&
              this.props.chapterErrorList &&
              Array.isArray(chapterErrorList) &&
              chapterErrorList.length > 0 ? (
              <div className="alert alert-danger text-center mt-2" role="alert">
                <strong>{this.props.t('common:error.' + chapterErrorList[0].code)}</strong>
              </div>
            ) : (
              <div className="card my-3">
                <h6 className="card-header">
                  <span className="fas fa-plus-circle fa-fw " /> {t('chapter-new:chapter-edit-header')}
                </h6>
                <EditChapterForm {...this.props} />
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

EditChapter.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
  saveUpdateChapter: PropTypes.func.isRequired,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  loadChapter: PropTypes.func,
  currentUser: PropTypes.object,
  chapterErrorList: PropTypes.array,
  chapterLoading: PropTypes.bool,
  currentChapter: PropTypes.object,
  saveOrEditChapterResult: PropTypes.string,
  rehydrated: PropTypes.bool,
  loading: PropTypes.bool,
};

const stateToProps = ({ user, chapter, _persist }) => ({
  currentUser: user.user,
  chapterErrorList: chapter.errorList,
  chapterLoading: chapter.loading,
  currentChapter: chapter.currentChapter,
  saveOrEditChapterResult: chapter.saveOrEditChapterResult,
  rehydrated: _persist.rehydrated,
  loading: chapter.loading,
});
const dispatchToProps = {
  saveUpdateChapter,
  sessionTimeout,
  updateAccessToken,
  loadChapter,
};

EditChapter.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
};

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation(['chapter-new', 'language-list'])(withRouter(SecurePageWrapper(EditChapter)))));
