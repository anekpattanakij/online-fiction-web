import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
// import CoinIcon from '../components/CoinIcon';
import Loading from '../components/Loading';
import ReportModal from '../components/ReportModal';
import BigCover from '../components/BigCover';
import ChapterListItem from '../components/ChapterListItem';
import { preventNaNNumber } from '../util/converterUtil';
import { loadFiction, rateFiction, changeStatusFiction } from '../redux-saga/action/fictionAction';
import { loadChapterList } from '../redux-saga/action/chapterAction';
import { sessionTimeout, updateAccessToken } from '../redux-saga/action/userAction';
import { connect } from 'react-redux';
import { withTranslation, Link } from '../i18n';
import { withRouter } from 'next/router';
import Fiction from '../common/Fiction';
import { ERROR_CODE_FICTION_NOT_EXIST, ERROR_CODE_NETWORK_ERROR, ERROR_CODE_FICTION_SUSPEND_OR_DELETE } from '../common/Error';
import { FICTION_STATUS } from '../config/fictionStatusList';
import '../static/css/blank.css';

class FictionPage extends React.Component {
  state = { firstLoad: false };

  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'fiction', 'genres', 'fiction-status'],
    };
  }

  constructor(props) {
    super(props);
    this.rateFictionChange = this.rateFictionChange.bind(this);
    this.changeFictionStatus = this.changeFictionStatus.bind(this);
  }

  componentDidUpdate() {
    if (this.props.rehydrated && !this.state.firstLoad) {
      if (!this.props.chapterList || this.props.chapterFromFictionId !== this.props.router.query.fiction) {
        this.setState({ firstLoad: true });
        if (this.props.currentUser && this.props.currentUser.accessToken) {
          this.props.loadChapterList(
            this.props.router.query.fiction,
            this.props.i18n.language.toUpperCase(),
            this.props.sessionTimeout,
            this.props.updateAccessToken,
            this.props.currentUser,
          );
        } else {
          this.props.loadChapterList(this.props.router.query.fiction, this.props.i18n.language.toUpperCase());
        }
      }
    }
    return null;
  }

  componentDidMount() {
    if (!this.props.currentFiction || this.props.currentFiction.fictionId !== this.props.router.query.fiction) {
      this.props.loadFiction(this.props.router.query.fiction);
    }
    if (this.props.chapterList || this.props.chapterFromFictionId !== this.props.router.query.fiction) {
      if (this.props.currentUser && this.props.currentUser.accessToken) {
        this.props.loadChapterList(
          this.props.router.query.fiction,
          this.props.i18n.language.toUpperCase(),
          this.props.sessionTimeout,
          this.props.updateAccessToken,
          this.props.currentUser,
        );
      } else {
        this.props.loadChapterList(this.props.router.query.fiction, this.props.i18n.language.toUpperCase());
      }
    }
  }

  rateFictionChange(e) {
    this.props.rateFiction(
      this.props.sessionTimeout,
      this.props.updateAccessToken,
      this.props.currentUser,
      this.props.currentFiction.fictionId,
      e,
    );
  }

  changeFictionStatus(e) {
    this.props.changeStatusFiction(
      this.props.sessionTimeout,
      this.props.updateAccessToken,
      this.props.currentUser,
      this.props.currentFiction.fictionId,
      e,
    );
  }

  render() {
    const { t, currentFiction, fictionErrorList, currentUser, i18n } = this.props;
    let networkError = false;
    if (fictionErrorList && fictionErrorList.length > 0) {
      fictionErrorList.map(errorItem => {
        if (
          errorItem &&
          errorItem.code &&
          (errorItem.code === ERROR_CODE_FICTION_NOT_EXIST || errorItem.code === ERROR_CODE_FICTION_SUSPEND_OR_DELETE)
        ) {
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
            <Helmet title={(currentFiction ? Fiction.displayFictionName(currentFiction, i18n.language) : '') + t('fiction:title')} />
            <div className="card mb-3  mt-3">
              <h6 className="card-header d-flex align-items-center py-2">
                <span className="fas fa-book fa-fw " />{' '}
                <span className="mx-1">{currentFiction ? Fiction.displayFictionName(currentFiction, i18n.language) : ''}</span>
                <span className="ml-1" />
              </h6>

              <div className="card-body p-0">
                {this.props.fictionLoading ? (
                  <div className="row edit">
                    <Loading loading={this.props.fictionLoading} t={t} />
                  </div>
                ) : (
                  <div className="row edit">
                    <div className="col-xl-3 col-lg-4 col-md-5">
                      <BigCover imageUrl={currentFiction && currentFiction.cover} />
                    </div>
                    <div className="col-xl-9 col-lg-8 col-md-7">
                      <div className="row m-0 py-1 px-0">
                        <div className="col-lg-3 col-xl-2 strong">{t('fiction:names')}:</div>
                        <div className="col-lg-9 col-xl-10">
                          <ul className="list-inline m-0">
                            <li className="list-inline-item">
                              {currentFiction && currentFiction.fictionName
                                ? currentFiction.fictionName.map((fictionNameItem, key) => (
                                    <React.Fragment key={'alt-name-' + key}>
                                      <span className="fas fa-book fa-fw " /> {fictionNameItem.name}
                                    </React.Fragment>
                                  ))
                                : ''}
                            </li>{' '}
                          </ul>
                        </div>
                      </div>
                      <div className="row m-0 py-1 px-0 border-top">
                        <div className="col-lg-3 col-xl-2 strong">{t('fiction:author')}:</div>
                        <div className="col-lg-9 col-xl-10">
                          {currentFiction && currentFiction.author ? (
                            <Link
                              href={'/user?user=' + currentFiction.author.cif}
                              as={'/user/' + currentFiction.author.cif + '/' + currentFiction.author.displayName}
                            >
                              <a>{currentFiction.author.displayName}</a>
                            </Link>
                          ) : (
                            ''
                          )}
                        </div>
                      </div>
                      <div className="row m-0 py-1 px-0 border-top">
                        <div className="col-lg-3 col-xl-2 strong">{t('fiction:genre')}:</div>
                        <div className="col-lg-9 col-xl-10">
                          {currentFiction && currentFiction.categories
                            ? currentFiction.categories.map((categoryItem, key) => (
                                <React.Fragment key={'alt-name-' + key}>
                                  <a className="badge badge-secondary" href={'/genre/' + categoryItem}>
                                    {t('genres:' + categoryItem)}
                                  </a>{' '}
                                </React.Fragment>
                              ))
                            : ''}
                        </div>
                      </div>

                      <div className="row m-0 py-1 px-0 border-top">
                        <div className="col-lg-3 col-xl-2 strong">{t('fiction:rating')}:</div>
                        <div className="col-lg-9 col-xl-10">
                          <ul className="list-inline m-0">
                            <li className="list-inline-item">
                              <span className="text-primary">
                                <span className="fas fa-star fa-fw " title="rating" />{' '}
                                {currentFiction ? Number(preventNaNNumber(currentFiction.rating)).toFixed(2) : 0}
                              </span>{' '}
                            </li>
                            <li className="list-inline-item small">
                              <span className="fas fa-user fa-fw " title="Voter" />{' '}
                              {currentFiction ? Fiction.getTotalVoter(currentFiction) : 0}
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="row m-0 py-1 px-0 border-top">
                        <div className="col-lg-3 col-xl-2 strong">{t('fiction:status')}:</div>
                        <div className="col-lg-9 col-xl-10">{t('fiction-status:' + (currentFiction && currentFiction.status))}</div>
                      </div>
                      <div className="row m-0 py-1 px-0 border-top">
                        <div className="col-lg-3 col-xl-2 strong">{t('fiction:number-of-chapter')}:</div>
                        <div className="col-lg-9 col-xl-10">
                          <ul className="list-inline m-0">
                            <li className="list-inline-item">
                              <span className="far fa-file fa-fw " title="Total chapters" />{' '}
                              {currentFiction ? currentFiction.lastChapter : 0}
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="row m-0 py-1 px-0 border-top">
                        <div className="col-lg-3 col-xl-2 strong">{t('fiction:short-story')}:</div>
                        <div className="col-lg-9 col-xl-10">
                          {currentFiction ? Fiction.displayShortDetail(currentFiction, i18n.language) : ''}
                        </div>
                      </div>
                      <div className="row m-0 py-1 px-0 border-top">
                        <div className="col-lg-3 col-xl-2 strong">{t('fiction:actions')}:</div>
                        <div className="col-lg-9 col-xl-10">
                          {currentUser &&
                          currentUser.cif &&
                          currentFiction &&
                          currentFiction.author &&
                          currentUser.cif === currentFiction.author.cif ? (
                            <div className="btn-group ">
                              <button
                                type="button"
                                className="btn btn-primary dropdown-toggle   mr-2"
                                data-toggle="dropdown"
                                disabled={!(currentUser && currentUser.cif && currentUser.cif)}
                              >
                                <span className="fas fa-edit fa-fw " />
                                {t('fiction:author-action')}
                                <span className="caret" />
                              </button>
                              <div className="dropdown-menu">
                                <Link
                                  href={'/chapter-new?chapter-new=' + currentFiction.fictionId}
                                  as={'/chapter-new/' + currentFiction.fictionId}
                                >
                                  <a className="dropdown-item" id="new_chapter_menu">
                                    <span className="fas fa-upload fa-fw " title="Add New Chapter" />{' '}
                                    <span className="d-inline">{t('fiction:add-new-chapter')}</span>
                                  </a>
                                </Link>
                                <Link
                                  href={'/edit-fiction?edit-fiction=' + currentFiction.fictionId}
                                  as={'/edit-fiction/' + currentFiction.fictionId}
                                >
                                  <a className="dropdown-item" id="new_chapter_menu">
                                    <span className="fas fa-edit fa-fw " title="Edit Fiction Detail" />{' '}
                                    <span className="d-inline">{t('fiction:edit-fiction-detail')}</span>
                                  </a>
                                </Link>
                                <a
                                  className="dropdown-item"
                                  id="complete_fiction_menu"
                                  onClick={() => this.changeFictionStatus(FICTION_STATUS.COMPLETED)}
                                >
                                  <span className="fas fa-check fa-fw " title="Complete Fiction" />{' '}
                                  <span className="d-inline">{t('fiction:mark-as-complete-fiction')}</span>
                                </a>
                                <a
                                  className="dropdown-item"
                                  id="on_hold_fiction_menu"
                                  onClick={() => this.changeFictionStatus(FICTION_STATUS.SUSPEND)}
                                >
                                  <span className="fas fa-pause fa-fw " title="On hold Fiction" />{' '}
                                  <span className="d-inline">{t('fiction:mark-as-onhold-fiction')}</span>
                                </a>
                                <a
                                  className="dropdown-item"
                                  id="drop_fiction_menu"
                                  onClick={() => this.changeFictionStatus(FICTION_STATUS.DROP)}
                                >
                                  <span className="fas fa-trash fa-fw " title="Drop Fiction" />{' '}
                                  <span className="d-inline">{t('fiction:mark-as-drop-fiction')}</span>
                                </a>
                              </div>
                            </div>
                          ) : (
                            ''
                          )}
                          <Link
                            href={'/translate-fiction?translate-fiction=' + (currentFiction && currentFiction.fictionId)}
                            as={'/translate-fiction/' + (currentFiction && currentFiction.fictionId)}
                          >
                            <a>
                              <button className="btn btn-secondary  mr-2" id="translate_button">
                                <span className="fas fa-language fa-fw " title="Translate" />{' '}
                                <span className="d-none d-xl-inline">{t('fiction:translate-fiction')}</span>
                              </button>
                            </a>
                          </Link>
                          <div className="btn-group ">
                            <button
                              type="button"
                              className="btn btn-primary dropdown-toggle"
                              data-toggle="dropdown"
                              disabled={!(currentUser && currentUser.cif)}
                            >
                              <span className="fas fa-star fa-fw " /> <span className="caret" />
                            </button>
                            <div className="dropdown-menu">
                              <a className="dropdown-item small" id="10" onClick={() => this.rateFictionChange(10)}>
                                (10) {t('fiction:rating-score.rating-10')}
                              </a>
                              <a className="dropdown-item small" id="9" onClick={() => this.rateFictionChange(9)}>
                                (9) {t('fiction:rating-score.rating-9')}
                              </a>
                              <a className="dropdown-item small" id="8" onClick={() => this.rateFictionChange(8)}>
                                (8) {t('fiction:rating-score.rating-8')}
                              </a>
                              <a className="dropdown-item small" id="7" onClick={() => this.rateFictionChange(7)}>
                                (7) {t('fiction:rating-score.rating-7')}
                              </a>
                              <a className="dropdown-item small" id="6" onClick={() => this.rateFictionChange(6)}>
                                (6) {t('fiction:rating-score.rating-6')}
                              </a>
                              <a className="dropdown-item small" id="5" onClick={() => this.rateFictionChange(5)}>
                                (5) {t('fiction:rating-score.rating-5')}
                              </a>
                              <a className="dropdown-item small" id="4" onClick={() => this.rateFictionChange(4)}>
                                (4) {t('fiction:rating-score.rating-4')}
                              </a>
                              <a className="dropdown-item small" id="3" onClick={() => this.rateFictionChange(3)}>
                                (3) {t('fiction:rating-score.rating-3')}
                              </a>
                              <a className="dropdown-item small" id="2" onClick={() => this.rateFictionChange(2)}>
                                (2) {t('fiction:rating-score.rating-2')}
                              </a>
                              <a className="dropdown-item small" id="1" onClick={() => this.rateFictionChange(1)}>
                                (1) {t('fiction:rating-score.rating-1')}
                              </a>
                            </div>
                          </div>{' '}
                          <button
                            type="button"
                            className="btn btn-warning float-right mr-1"
                            data-toggle="modal"
                            data-target="#modal-report"
                          >
                            <span className="fas fa-flag fa-fw " /> <span className="d-none d-xl-inline">{t('fiction:report')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <ul className="edit nav nav-tabs" role="tablist">
              <li className="nav-item">
                <span className="far fa-file fa-fw " /> <span className="d-none d-md-inline">{t('fiction:chapters')}</span>
              </li>
            </ul>
            {this.props.chapterListLoading ? (
              <div className="tab-content">
                <div className="no-chapter-container text-center">
                  <Loading loading={this.props.chapterListLoading} t={t} />
                </div>
              </div>
            ) : this.props.chapterList && this.props.chapterList.length > 0 ? (
              <div className="edit tab-content">
                <div className="chapter-container ">
                  <div className="row no-gutters">
                    <div className="col ">
                      <div className="chapter-row d-flex row no-gutters p-2 align-items-center border-bottom odd-row">
                        <div className="col col-lg-5 row no-gutters pr-1 order-lg-2">
                          <span className="far fa-file fa-fw " title="Chapter" />
                        </div>
                        <div className="col-2 col-lg-2 ml-1 text-right order-lg-8">
                          <span className="far fa-clock fa-fw " title="Age" />
                        </div>
                        <div className="w-100 d-lg-none" />
                        <div className="col-auto text-center order-lg-4" style={{ flex: '0 0 2.5em' }}>
                          <span className="fas fa-globe fa-fw " title="Language" />
                        </div>
                        <div className="col order-lg-5">
                          <span className="fas fa-dollar-sign fa-fw " title="Coin" />
                        </div>
                        <div className="col-auto col-lg-1 text-right mx-1 order-lg-6">
                          <span className="fas fa-user fa-fw " title="Author" />
                        </div>
                        <div className="col-2 col-lg-1 text-right text-info order-lg-7">
                          <span className="fas fa-eye fa-fw " title="Views" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {this.props.chapterList.map((chapterItem, key) => (
                    <ChapterListItem chapter={chapterItem} t={t} key={key} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="tab-content">
                <div className="no-chapter-container text-center">{t('fiction:no-chapter')}</div>
              </div>
            )}
          </React.Fragment>
        )}
        <ReportModal translate={this.props.t} />
      </div>
    );
  }
}

FictionPage.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
  loadFiction: PropTypes.func,
  rateFiction: PropTypes.func,
  changeStatusFiction: PropTypes.func,
  currentUser: PropTypes.object,
  fictionErrorList: PropTypes.array,
  fictionLoading: PropTypes.bool,
  currentFiction: PropTypes.object,
  i18n: PropTypes.object,
  loadChapterList: PropTypes.func,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  chapterList: PropTypes.array,
  chapterErrorList: PropTypes.array,
  chapterListLoading: PropTypes.bool,
  chapterFromFictionId: PropTypes.string,
  rehydrated: PropTypes.bool,
};

const stateToProps = ({ fiction, user, chapter, _persist }) => ({
  currentUser: user.user,
  fictionErrorList: fiction.errorList,
  fictionLoading: fiction.loading,
  currentFiction: fiction.currentFiction,
  chapterList: chapter.chapterList,
  chapterErrorList: chapter.errorList,
  chapterListLoading: chapter.chapterListloading,
  chapterFromFictionId: chapter.loadFromFictionId,
  rehydrated: _persist.rehydrated,
});

const dispatchToProps = { loadFiction, rateFiction, loadChapterList, sessionTimeout, updateAccessToken, changeStatusFiction };

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation(['fiction', 'genres', 'fiction-status'])(FictionPage)));
