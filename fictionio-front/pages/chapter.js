import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { generateStaticPath } from '../util/staticPathUtil';
import Loading from '../components/Loading';
import ReportModal from '../components/ReportModal';
import { preventNaNNumber } from '../util/converterUtil';
import { loadFiction } from '../redux-saga/action/fictionAction';
import { loadChapter, rateChapter, publishChapter, purchaseChapter } from '../redux-saga/action/chapterAction';
import { sessionTimeout, updateAccessToken } from '../redux-saga/action/userAction';
import { connect } from 'react-redux';
import { withTranslation, Link } from '../i18n';
import { withRouter } from 'next/router';
import ReactSVG from 'react-svg';
import Fiction from '../common/Fiction';
import { API_CALLING_METHOD, callNonSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../common/ApiPortal';
import { API_FICTION_URL, API_REDUCE_CHAPTER_FICTION_URL } from '../redux-saga/saga/fictionSaga';
import { FICTION_STATUS } from '../config/fictionStatusList';
import { ERROR_CODE_CHAPTER_NOT_EXIST } from '../common/Error';
import ValidatingEhtereum from '../components/modalComponents/ValidatingEhtereum';
import '../static/css/blank.css';

class Chapter extends React.Component {
  state = {
    showSideMenu: true,
    reduceChapterList: null,
    reduceChapterListLoading: false,
    setSelectedChapterList: false,
  };

  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'chapter'],
    };
  }

  constructor(props) {
    super(props);
    this.toggleSideMenu = this.toggleSideMenu.bind(this);
    this.previousChapter = this.previousChapter.bind(this);
    this.nextChapter = this.nextChapter.bind(this);
    this.changeChapter = this.changeChapter.bind(this);
    this.rateChapterChange = this.rateChapterChange.bind(this);
    this.loadReduceChapterList = this.loadReduceChapterList.bind(this);
    this.publishChapter = this.publishChapter.bind(this);
    this.purchaseChapter = this.purchaseChapter.bind(this);
    this.purchaseCoin = this.purchaseCoin.bind(this);
  }

  toggleSideMenu(e) {
    this.setState({ showSideMenu: !this.state.showSideMenu });
    return e;
  }

  componentDidUpdate() {
    // get fiction and reduce chapter list after retreive chapter id
    if (this.props.rehydrated) {
      if ((!this.props.chapter || this.props.chapter.chapterId !== this.props.router.query.chapter) && !this.props.chapterLoading) {
        if (this.props.currentUser && this.props.currentUser.accessToken) {
          this.props.loadChapter(
            this.props.router.query.chapter,
            this.props.sessionTimeout,
            this.props.updateAccessToken,
            this.props.currentUser,
          );
        } else {
          this.props.loadChapter(this.props.router.query.chapter);
        }
      }
      if (this.props.chapter && this.props.chapter.chapterId && this.props.chapter.chapterId === this.props.router.query.chapter) {
        if (
          !(this.props.currentFiction && this.props.currentFiction.fictionId === this.props.chapter.fictionId) &&
          !this.props.fictionLoading &&
          !(this.props.fictionErrorList && this.props.fictionErrorList.length > 0)
        ) {
          this.props.loadFiction(this.props.chapter.fictionId);
        }
        if (!this.state.reduceChapterList && !this.state.reduceChapterListLoading) {
          this.loadReduceChapterList(this.props.chapter.fictionId, this.props.chapter.author.cif, this.props.chapter.language);
        }
      }
      if (!this.props.chapter && this.props.chapterErrorList) {
        if (Array.isArray(this.props.chapterErrorList)) {
          this.props.chapterErrorList.map(errorListItem => {
            if (errorListItem && errorListItem.code === ERROR_CODE_CHAPTER_NOT_EXIST) {
              this.props.router.push('/content-not-found');
            }
          });
        }
      }
    }
    return null;
  }

  componentDidMount() {
    if (Array.isArray(this.props.reduceChapterList)) {
      this.setState({ reduceChapterList: this.props.reduceChapterList });
    }
    if (this.props.rehydrated) {
      if (!this.props.chapter || this.props.chapterFromFictionId !== this.props.router.query.chapter) {
        if (this.props.currentUser && this.props.currentUser.accessToken) {
          this.props.loadChapter(
            this.props.router.query.chapter,
            this.props.sessionTimeout,
            this.props.updateAccessToken,
            this.props.currentUser,
          );
        } else {
          this.props.loadChapter(this.props.router.query.chapter);
        }
      }
    }
  }

  previousChapter(currentChapterNumber) {
    let previousChapterId = null;
    let runningChapter = -1;
    if (Array.isArray(this.state.reduceChapterList) && this.state.reduceChapterList.length > 0) {
      this.state.reduceChapterList.map(chapterItem => {
        if (runningChapter < chapterItem.chapterNumberInFiction && chapterItem.chapterNumberInFiction < currentChapterNumber) {
          runningChapter = chapterItem.chapterNumberInFiction;
          previousChapterId = chapterItem.chapterId;
        }
      });
      if (runningChapter === -1) {
        previousChapterId = null;
      }
    }
    return previousChapterId;
  }

  nextChapter(currentChapterNumber) {
    let nextChapterId = null;
    let runningChapter = Number.MAX_SAFE_INTEGER;
    if (Array.isArray(this.state.reduceChapterList) && this.state.reduceChapterList.length > 0) {
      this.state.reduceChapterList.map(chapterItem => {
        if (runningChapter > chapterItem.chapterNumberInFiction && chapterItem.chapterNumberInFiction > currentChapterNumber) {
          runningChapter = chapterItem.chapterNumberInFiction;
          nextChapterId = chapterItem.chapterId;
        }
      });
      if (runningChapter === Number.MAX_SAFE_INTEGER) {
        nextChapterId = null;
      }
    }
    return nextChapterId;
  }

  publishChapter() {
    this.props.publishChapter(
      this.props.sessionTimeout,
      this.props.updateAccessToken,
      this.props.currentUser,
      this.props.router.query.chapter,
    );
  }

  purchaseChapter() {
    this.props.purchaseChapter(
      this.props.sessionTimeout,
      this.props.updateAccessToken,
      this.props.currentUser,
      this.props.router.query.chapter,
    );
  }

  purchaseCoin() {
    this.props.router.push('/coin-purchase');
  }

  changeChapter(e) {
    if (e.target.value !== this.props.router.query.chapter) {
      this.props.router.push('/chapter/' + e.target.value);
    }
  }

  rateChapterChange(e) {
    this.props.rateChapter(
      this.props.sessionTimeout,
      this.props.updateAccessToken,
      this.props.currentUser,
      this.props.chapter.chapterId,
      e,
    );
  }

  loadReduceChapterList = async (fictionId, authorCif, language) => {
    try {
      this.setState({ reduceChapterListLoading: true });
      let response = await callNonSecureApi(API_FICTION_URL + '/' + fictionId + API_REDUCE_CHAPTER_FICTION_URL, API_CALLING_METHOD.GET, {
        language: language,
        author: authorCif,
      });

      if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
        const returnChapterList = response.data;
        if (Array.isArray(returnChapterList)) {
          returnChapterList.sort((a, b) => (a.chapterNumberInFiction < b.chapterNumberInFiction ? 1 : -1));
        }
        //returnChapterList.sort
        this.setState({ reduceChapterList: returnChapterList, reduceChapterListLoading: false });
        if (this.setState.selectItem) {
          this.setState.selectItem.value = this.props.router.query.chapter;
        }
      } else {
        throw response;
      }
    } catch (err) {
      // do nothing
    }
  };

  render() {
    const { t } = this.props;
    return (
      <React.Fragment>
        <link rel="stylesheet" type="text/css" href={generateStaticPath('/reader.css')} />
        <Helmet title={this.props.chapter ? this.props.chapter.chapterName + t('chapter-header') : 'Fictionio'} />

        <div
          className={
            this.state.showSideMenu
              ? 'reader row flex-column no-gutters layout-horizontal fit-horizontal'
              : 'reader row flex-column no-gutters layout-horizontal fit-horizontal  hide-sidebar'
          }
          role="main"
          id="content"
          style={{ minWidth: '100%' }}
        >
          <div className="container reader-controls-container p-0">
            <div className="reader-controls-wrapper bg-reader-controls row no-gutters flex-nowrap" style={{ zIndex: 1 }}>
              <div
                id="reader-controls-collapser"
                className="d-none d-lg-flex col-auto justify-content-center align-items-center cursor-pointer"
                onClick={e => this.toggleSideMenu(e)}
              >
                <span style={!this.state.showSideMenu ? { display: 'none' } : {}}>
                  <span className={'fas fa-caret-right fa-fw arrow-link'} title="Collapse menu" />
                </span>
                <span style={this.state.showSideMenu ? { display: 'none' } : {}}>
                  <span className={'fas fa-caret-left fa-fw arrow-link'} title="Collapse menu" />
                </span>
              </div>

              <div className="reader-controls col row no-gutters flex-column flex-nowrap">
                <div className="reader-controls-title col-auto text-center p-2">
                  <div style={{ fontSize: '1.25em' }}>
                    {this.props.currentFiction && this.props.currentFiction.originalFictionLanguage ? (
                      <ReactSVG
                        className="flag-icon"
                        src={generateStaticPath(
                          '/img/flag/' + ('' + this.props.currentFiction.originalFictionLanguage).toLowerCase() + '.svg',
                        )}
                      />
                    ) : (
                      ''
                    )}
                    {this.props.currentFiction ? (
                      <Link
                        href={'/fiction?fiction=' + this.props.currentFiction.fictionId}
                        as={'/fiction/' + this.props.currentFiction.fictionId}
                      >
                        <a className="pl-2">{Fiction.displayFictionName(this.props.currentFiction, this.props.i18n.language)}</a>
                      </Link>
                    ) : (
                      ''
                    )}
                  </div>
                  <div className="d-none d-lg-block">
                    <span className="chapter-title" data-chapter-id="550084">
                      {this.props.chapter && this.props.chapter.chapterName}
                    </span>
                    <span className="chapter-tag-end badge badge-primary d-none">END</span>
                  </div>
                </div>
                <div className="reader-controls-chapters col-auto row no-gutters align-items-center">
                  {this.props.chapter && this.previousChapter(this.props.chapter.chapterNumberInFiction) ? (
                    <Link
                      href={'/chapter?chapter=' + this.previousChapter(this.props.chapter.chapterNumberInFiction)}
                      as={'/chapter/' + this.previousChapter(this.props.chapter.chapterNumberInFiction)}
                    >
                      <a className="chapter-link-left col-auto arrow-link" title="previous chapter">
                        <span className="fas fa-angle-left fa-fw" />
                      </a>
                    </Link>
                  ) : (
                    ''
                  )}
                  <div className="col py-2">
                    <select
                      className="form-control col"
                      id="jump-chapter"
                      name="jump-chapter"
                      onChange={e => this.changeChapter(e)}
                      value={this.props.router.query.chapter}
                    >
                      {Array.isArray(this.state.reduceChapterList) &&
                        this.state.reduceChapterList.map((chapterItem, key) => (
                          <option value={chapterItem.chapterId} key={'chapter' + key}>
                            {chapterItem.displayChapterNumber === 0
                              ? t('common:special')
                              : t('chapter:short-chapter-number') + ' ' + preventNaNNumber(chapterItem.displayChapterNumber)}{' '}
                            {chapterItem.chapterName}
                          </option>
                        ))}
                    </select>
                  </div>
                  {this.props.chapter && this.nextChapter(this.props.chapter.chapterNumberInFiction) ? (
                    <Link
                      href={'/chapter?chapter=' + this.nextChapter(this.props.chapter.chapterNumberInFiction)}
                      as={'/chapter/' + this.nextChapter(this.props.chapter.chapterNumberInFiction)}
                    >
                      <a className="chapter-link-right col-auto arrow-link" title="next chapter">
                        <span className="fas fa-angle-right fa-fw" />
                      </a>
                    </Link>
                  ) : (
                    ''
                  )}
                </div>
                <div className="reader-controls-groups col-auto row no-gutters">
                  <ul className="col list-unstyled p-2 m-0 chapter-link">
                    <li>
                      {this.props.chapter && this.props.chapter.language ? (
                        <ReactSVG
                          className="flag-icon"
                          src={generateStaticPath('/img/flag/' + ('' + this.props.chapter.language).toLowerCase() + '.svg')}
                        />
                      ) : (
                        ''
                      )}
                      <strong className="pl-2">
                        {this.props.chapter && this.props.chapter.author ? (
                          <Link
                            href={'/user?user=' + this.props.chapter.author.cif}
                            as={'/user/' + this.props.chapter.author.cif + '/' + this.props.chapter.author.displayName}
                          >
                            <a>{this.props.chapter.author.displayName}</a>
                          </Link>
                        ) : (
                          ''
                        )}
                        <div className="d-flex d-lg-none" style={{ display: 'inline', float: 'right' }}>
                          {this.props.chapter &&
                          this.props.chapter.ethereumBlockAddress &&
                          this.props.chapter.ethereumBlockAddress !== '' ? (
                            <React.Fragment>
                              <a target="_blank" href={'https://etherscan.io/tx/' + this.props.chapter.ethereumBlockAddress}>
                                <ReactSVG
                                  src={generateStaticPath('/img/ethereum-green.svg')}
                                  wrapper="span"
                                  beforeInjection={svg => {
                                    svg.setAttribute('style', 'width: 40px;height:40px');
                                  }}
                                />
                              </a>
                            </React.Fragment>
                          ) : (
                            <a data-toggle="modal" data-target="#eth_modal">
                              <ReactSVG
                                src={generateStaticPath('/img/ethereum-gray.svg')}
                                wrapper="span"
                                beforeInjection={svg => {
                                  svg.setAttribute('style', 'width: 30px;height:30px');
                                }}
                              />
                            </a>
                          )}
                        </div>
                      </strong>
                    </li>
                  </ul>
                </div>
                <div className="reader-controls-unsupported col-auto row no-gutters p-2 text-danger d-none" />
                <div className="reader-controls-actions col-auto row no-gutters p-1">
                  <div className="col row no-gutters" style={{ minWidth: '120px' }}>
                    <div className="btn-group col ">
                      <button
                        type="button"
                        className="btn btn-primary dropdown-toggle m-1"
                        data-toggle="dropdown"
                        disabled={!(this.props.currentUser && this.props.currentUser.cif)}
                      >
                        <span className="fas fa-star fa-fw " /> <span className="caret" />
                      </button>
                      <div className="dropdown-menu">
                        <a className="dropdown-item small" id="10" onClick={() => this.rateChapterChange(10)}>
                          (10) {t('chapter:rating-score.rating-10')}
                        </a>
                        <a className="dropdown-item small" id="9" onClick={() => this.rateChapterChange(9)}>
                          (9) {t('chapter:rating-score.rating-9')}
                        </a>
                        <a className="dropdown-item small" id="8" onClick={() => this.rateChapterChange(8)}>
                          (8) {t('chapter:rating-score.rating-8')}
                        </a>
                        <a className="dropdown-item small" id="7" onClick={() => this.rateChapterChange(7)}>
                          (7) {t('chapter:rating-score.rating-7')}
                        </a>
                        <a className="dropdown-item small" id="6" onClick={() => this.rateChapterChange(6)}>
                          (6) {t('chapter:rating-score.rating-6')}
                        </a>
                        <a className="dropdown-item small" id="5" onClick={() => this.rateChapterChange(5)}>
                          (5) {t('chapter:rating-score.rating-5')}
                        </a>
                        <a className="dropdown-item small" id="4" onClick={() => this.rateChapterChange(4)}>
                          (4) {t('chapter:rating-score.rating-4')}
                        </a>
                        <a className="dropdown-item small" id="3" onClick={() => this.rateChapterChange(3)}>
                          (3) {t('chapter:rating-score.rating-3')}
                        </a>
                        <a className="dropdown-item small" id="2" onClick={() => this.rateChapterChange(2)}>
                          (2) {t('chapter:rating-score.rating-2')}
                        </a>
                        <a className="dropdown-item small" id="1" onClick={() => this.rateChapterChange(1)}>
                          (1) {t('chapter:rating-score.rating-1')}
                        </a>
                      </div>
                    </div>
                    {this.props.chapter ? (
                      <Link
                        href={'/chapter-comment?chapter-comment=' + this.props.chapter.chapterId}
                        as={'/chapter-comment/' + this.props.chapter.chapterId}
                      >
                        <a title="Comment Chapter" className="btn btn-secondary col m-1" role="button" id="edit-chapter-button">
                          <span className="fas fa-comments fa-fw" />{' '}
                          {this.props.chapter && this.props.chapter.numberOfComment > 0 ? this.props.chapter.numberOfComment : ''}
                        </a>
                      </Link>
                    ) : (
                      ''
                    )}
                    {this.props.chapter &&
                    this.props.chapter.author &&
                    this.props.currentUser &&
                    this.props.currentUser.cif === this.props.chapter.author.cif ? (
                      <Link
                        href={'/edit-chapter?edit-chapter=' + this.props.chapter.chapterId}
                        as={'/edit-chapter/' + this.props.chapter.chapterId}
                      >
                        <a title="Edit Chapter" className="btn btn-secondary col m-1" role="button" id="edit-chapter-button">
                          <span className="fas fa-edit fa-fw" />
                        </a>
                      </Link>
                    ) : (
                      <a
                        title="Report"
                        className="btn btn-secondary col m-1"
                        role="button"
                        id="report-button"
                        data-toggle="modal"
                        data-target="#modal-report"
                      >
                        <span className="fas fa-flag fa-fw" />
                      </a>
                    )}
                  </div>
                </div>
                {this.props.chapter &&
                this.props.chapter.chapterContent &&
                this.props.chapter.chapterContent !== '' &&
                this.props.chapter.status === FICTION_STATUS.PUBLISH ? (
                  <div className="reader-controls-actions col-auto row no-gutters p-1" style={{ borderTop: 'none' }}>
                    <div className="col row no-gutters" style={{ minWidth: '120px' }}>
                      <Link
                        href={'/translate-chapter?translate-chapter=' + this.props.router.query.chapter}
                        as={'/translate-chapter/' + this.props.router.query.chapter}
                      >
                        <a className="btn btn-secondary col m-1">
                          <span className="fas fa-language fa-fw " title="Translate" /> <span>{t('chapter:translate-chapter')}</span>
                        </a>
                      </Link>
                    </div>
                  </div>
                ) : (
                  ''
                )}
                {this.props.chapter && this.props.chapter.status === FICTION_STATUS.DRAFT ? (
                  <div className="reader-controls-actions col-auto row no-gutters p-1" style={{ borderTop: 'none' }}>
                    <div className="col row no-gutters" style={{ minWidth: '120px' }}>
                      <button
                        type="button"
                        className="btn btn-primary col m-1"
                        onClick={() => this.publishChapter()}
                        disabled={this.props.loadingPublish}
                      >
                        <React.Fragment>
                          <span className="fas fa-globe fa-fw " title="Translate" /> <span>{t('chapter:publish-chapter')}</span>
                        </React.Fragment>
                      </button>
                    </div>
                  </div>
                ) : (
                  ''
                )}

                <div
                  className="reader-controls-stamp col-auto mt-auto d-none d-lg-flex justify-content-center"
                  style={{ flex: '0 1 auto', overflow: 'hidden' }}
                >
                  <div className="text-muted text-center  row no-gutters flex-wrap justify-content-center p-2">
                    <div className="col-auto">
                      {this.props.chapter && this.props.chapter.status === FICTION_STATUS.DRAFT ? (
                        t('chapter:publish-first')
                      ) : this.props.chapter &&
                        this.props.chapter.ethereumBlockAddress &&
                        this.props.chapter.ethereumBlockAddress !== '' ? (
                        <React.Fragment>
                          {t('chapter:ethereum-address')} :
                          <a target="_blank" href={'https://etherscan.io/tx/' + this.props.chapter.ethereumBlockAddress}>
                            {t('chapter:ethereum-click')}
                          </a>
                        </React.Fragment>
                      ) : (
                        t('chapter:creating-ethereum')
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className="reader-controls-footer col-auto mt-auto d-none d-lg-flex justify-content-center"
                  style={{ flex: '0 1 auto', overflow: 'hidden' }}
                >
                  <div className="text-muted text-center text-truncate row no-gutters flex-wrap justify-content-center p-2">
                    <div className="col-auto">
                      © 2019 <a href="https://fictionio.com/">Fictionio</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={
              this.state.showSideMenu
                ? 'reader-main reader-main-show col row no-gutters flex-column flex-nowrap noselect'
                : 'reader-main col row no-gutters flex-column flex-nowrap noselect'
            }
            style={{ flex: '1' }}
          >
            <noscript>
              <div className="alert alert-danger text-center">JavaScript is required for this reader to work.</div>
            </noscript>
            <div
              className="reader-goto-top d-flex d-lg-none justify-content-center align-items-center fade cursor-pointer"
              data-scroll="6344"
              data-turn="0"
              data-threshold="100"
            >
              <span className="fas fa-angle-up" />
            </div>
            <div className="d-none d-lg-inline mt-4 mb-4" />
            <div className="d-none d-lg-inline mt-2 mb-2" />
            <div className="reader-images col-auto row no-gutters flex-nowrap m-auto text-center cursor-pointer directional">
              <Loading loading={this.props.chapterLoading} t={t} />
              {this.props.chapterLoading || !this.props.chapter ? (
                ''
              ) : this.props.chapter && this.props.chapter.chapterContent === '' ? (
                this.props.currentUser &&
                this.props.currentUser.coin + (this.props.currentUser.withdrawableCoin || 0) < this.props.chapter.coin ? (
                  <button type="button" className="btn btn-primary m-1" onClick={() => this.purchaseCoin()}>
                    <span className="fas fa-shopping-cart fa-fw " />{' '}
                    {t('chapter:not-enough-coin', {
                      coin: this.props.currentUser.coin + (this.props.currentUser.withdrawableCoin || 0),
                      price: this.props.chapter.coin,
                    })}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary m-1"
                    onClick={() => this.purchaseChapter()}
                    disabled={this.props.chapterLoading}
                  >
                    <span className="fas fa-shopping-cart fa-fw " />
                    {t('chapter:purchase-this-chapter', { coin: this.props.chapter.coin })}
                  </button>
                )
              ) : (
                <div
                  className="text-left"
                  dangerouslySetInnerHTML={{
                    __html: this.props.chapter && this.props.chapter.chapterContent,
                  }}
                />
              )}
            </div>

            <div className="reader-load-icon">
              <span className="fas fa-circle-notch fa-spin" />
            </div>

            <footer className={this.state.showSideMenu ? 'next-page-footer show-sidebar' : 'next-page-footer hide-sidebar'}>
              {this.props.chapter && this.nextChapter(this.props.chapter.chapterNumberInFiction) ? (
                <Link
                  href={'/chapter?chapter=' + this.nextChapter(this.props.chapter.chapterNumberInFiction)}
                  as={'/chapter/' + this.nextChapter(this.props.chapter.chapterNumberInFiction)}
                >
                  <a>
                    <div
                      className="reader-image-wrapper col-auto my-auto justify-content-center align-items-center noselect nodrag row no-gutters reader-image-block py-3"
                      style={{ order: 29 }}
                    >
                      {t('chapter:next-page')}
                    </div>
                  </a>
                </Link>
              ) : (
                <div
                  className="reader-image-wrapper col-auto my-auto justify-content-center align-items-center noselect nodrag row no-gutters reader-image-block py-3"
                  style={{ order: 29 }}
                >
                  {t('chapter:no-more-chapter')}
                </div>
              )}
            </footer>
          </div>
          <ReportModal translate={this.props.t} />
          <ValidatingEhtereum translate={this.props.t} />
        </div>
      </React.Fragment>
    );
  }
}

Chapter.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
  currentUser: PropTypes.object,
  loadFiction: PropTypes.func,
  loadChapter: PropTypes.func,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  fictionErrorList: PropTypes.array,
  fictionLoading: PropTypes.bool,
  reduceChapterList: PropTypes.array,
  currentFiction: PropTypes.object,
  chapter: PropTypes.object,
  chapterErrorList: PropTypes.array,
  chapterLoading: PropTypes.bool,
  loadingPublish: PropTypes.bool,
  chapterFromFictionId: PropTypes.string,
  rehydrated: PropTypes.bool,
  rateChapter: PropTypes.func,
  publishChapter: PropTypes.func,
  purchaseChapter: PropTypes.func,
  i18n: PropTypes.object,
};

const stateToProps = ({ user, fiction, chapter, _persist }) => ({
  currentUser: user.user,
  fictionErrorList: fiction.errorList,
  fictionLoading: fiction.loading,
  reduceChapterList: fiction.chapterList,
  currentFiction: fiction.currentFiction,
  chapter: chapter.currentChapter,
  chapterErrorList: chapter.errorList,
  chapterLoading: chapter.loading,
  chapterFromFictionId: chapter.loadFromFictionId,
  loadingPublish: chapter.loadingPublish,
  rehydrated: _persist.rehydrated,
});

const dispatchToProps = { loadChapter, sessionTimeout, updateAccessToken, loadFiction, rateChapter, publishChapter, purchaseChapter };

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation(['chapter'])(Chapter)));
