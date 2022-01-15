import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withTranslation, Link } from '../i18n';
import { withRouter } from 'next/router';
import { loadFiction } from '../redux-saga/action/fictionAction';
import { saveNewChapter, resetCurrentChapter } from '../redux-saga/action/chapterAction';
import NewChapterForm from '../components/formComponents/NewChapterForm';
import { sessionTimeout, updateAccessToken } from '../redux-saga/action/userAction';
import SecurePageWrapper from '../hoc/securePageWrapper';
import { ERROR_CODE_FICTION_NOT_EXIST, ERROR_CODE_NETWORK_ERROR } from '../common/Error';
import '../static/css/blank.css';

class ChapterNew extends React.Component {
  constructor(props) {
    super(props);
  }

  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'chapter-new', 'language-list'],
    };
  }

  componentDidMount() {
    if (!this.props.currentFiction || this.props.currentFiction.fictionId !== this.props.router.query['chapter-new']) {
      this.props.loadFiction(this.props.router.query['chapter-new']);
    }
    this.props.resetCurrentChapter();
  }

  render() {
    const { t, currentFiction, currentUser, fictionErrorList, saveOrEditChapterResult } = this.props;
    let networkError = false;
    if (fictionErrorList && fictionErrorList.length > 0) {
      fictionErrorList.map(errorItem => {
        if (errorItem && errorItem.code && errorItem.code === ERROR_CODE_FICTION_NOT_EXIST) {
          this.props.router.push('/content-not-found');
        }
        if (errorItem && errorItem.code && errorItem.code === ERROR_CODE_NETWORK_ERROR) {
          networkError = true;
        }
      });
    }
    if (fictionErrorList && fictionErrorList.length === 0 && currentFiction && currentFiction.fictionId) {
      if (currentFiction.author.cif !== currentUser.cif) {
        this.props.router.push('/no-authorized');
      }
    }
    return (
      <div className="container" role="main" id="content">
        {networkError ? (
          <div className="alert alert-danger text-center mt-2" role="alert">
            <strong>{t('common:error.ERROR_CODE_DATABASE_CONNECTION')}</strong>
          </div>
        ) : typeof saveOrEditChapterResult == 'object' ? (
          <div className="alert alert-success text-center mt-2" role="alert">
            <strong>
              <Link
                href={'/chapter?chapter=' + ('' + (saveOrEditChapterResult && saveOrEditChapterResult.chapterId))}
                as={'/chapter/' + ('' + (saveOrEditChapterResult && saveOrEditChapterResult.chapterId))}
              >
                <a>
                  {this.props.t('chapter-new:chapter-new-success', {
                    chaptername: saveOrEditChapterResult && saveOrEditChapterResult.chapterName ? saveOrEditChapterResult.chapterName : '',
                  })}
                </a>
              </Link>
            </strong>
          </div>
        ) : (
          <React.Fragment>
            <Helmet title={t('chapter-new:chapter-new-title')} />
            <div className="card my-3">
              <h6 className="card-header">
                <span className="fas fa-plus-circle fa-fw " /> {t('chapter-new:chapter-new-header')}
              </h6>
              <NewChapterForm {...this.props} />
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }
}

ChapterNew.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
  loadFiction: PropTypes.func,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  currentUser: PropTypes.object,
  fictionErrorList: PropTypes.array,
  chapterErrorList: PropTypes.array,
  fictionLoading: PropTypes.bool,
  currentFiction: PropTypes.object,
  saveNewChapter: PropTypes.func,
  resetCurrentChapter: PropTypes.func,
  saveOrEditChapterResult: PropTypes.object,
  loading: PropTypes.bool,
};

const stateToProps = ({ fiction, user, chapter }) => ({
  currentUser: user.user,
  fictionErrorList: fiction.errorList,
  chapterErrorList: chapter.errorList,
  fictionLoading: fiction.loading,
  currentFiction: fiction.currentFiction,
  saveOrEditChapterResult: chapter.saveOrEditChapterResult,
  loading: chapter.loading,
});
const dispatchToProps = {
  loadFiction,
  sessionTimeout,
  updateAccessToken,
  saveNewChapter,
  resetCurrentChapter,
};

ChapterNew.propTypes = {
  t: PropTypes.func.isRequired,
};

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation(['common', 'chapter-new', 'language-list'])(SecurePageWrapper(ChapterNew))));
