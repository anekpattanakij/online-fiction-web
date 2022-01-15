/* eslint-disable no-undef */
import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from '../i18n';
import FictionCard from '../components/homeComponents/FictionCard';
import NewsCard from '../components/homeComponents/NewsCard';
import TopChapterItem from '../components/homeComponents/TopChapterItem';
import FeatureCarousel from '../components/homeComponents/FeatureCarousel';
import NewTitleCarousel from '../components/homeComponents/NewTitleCarousel';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Loading from '../components/Loading';
import { API_CALLING_METHOD, callNonSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../common/ApiPortal';
import {
  API_FICTION_URL,
  API_NEW_FICTION_URL,
  API_TOP_FICTION_URL,
  API_TOP_AND_RATE_FICTION_LANGUAGE_SUFFIX,
} from '../redux-saga/saga/fictionSaga';
import { API_CHAPTER_URL, API_NEW_CHAPTER_URL, API_FREE_ONLY_SUFFIX } from '../redux-saga/saga/chapterSaga';
import Config from '../config/index';

const NEWS_URL = Config.apiPath + '/news';

class Homepage extends React.Component {
  state = {
    fictionListTab: 'all',
    topChapterList: [],
    newChapterList: [],
    newFreeChapterList: [],
    topChapterErrorList: [],
    newChapterErrorList: [],
    newFreeChapterErrorList: [],
    topChapterLoading: true,
    newChapterLoading: true,
    newFreeChapterLoading: true,
    topFictionList: [],
    newFictionList: [],
    topFictionErrorList: [],
    newFictionErrorList: [],
    topFictionListLoading: true,
    newFictionListLoading: true,
    news: [],
    firstLoad : false,
  };

  constructor(props) {
    super(props);
    this.switchFictionTab = this.switchFictionTab.bind(this);
  }

  switchFictionTab = targetTab => {
    this.setState({ fictionListTab: targetTab });
  };
  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'home'],
    };
  }

  componentDidUpdate() {
    // get chapter after rehydrate becuase need current user information
    if (this.props.rehydrated && !this.state.firstLoad) {
      // fetch data
      this.setState({firstLoad:true});
      let loadedLanguage = [Config.i18n.whitelist];
      if (
        this.props.currentUser &&
        Array.isArray(this.props.currentUser.preferredLanguage) &&
        this.props.currentUser.preferredLanguage.length > 0
      ) {
        loadedLanguage = this.props.currentUser.preferredLanguage;
      }
      this.loadNewChapterList(loadedLanguage);
      this.loadNewFreeChapterList(loadedLanguage);
      this.loadTopChapterList(loadedLanguage);
      this.loadNewFictionList(loadedLanguage);
      this.loadTopFictionList(loadedLanguage);
    }
    return null;
  }

  componentDidMount() {
    this.loadNews();
  }

  loadNewFreeChapterList = async language => {
    try {
      const chapterResponse = await callNonSecureApi(
        API_CHAPTER_URL + API_NEW_CHAPTER_URL + API_TOP_AND_RATE_FICTION_LANGUAGE_SUFFIX + language.join() + API_FREE_ONLY_SUFFIX,
        API_CALLING_METHOD.GET
      );

      if (chapterResponse.result === RETURN_CODE_API_CALL_SUCCESS) {
        this.setState({ newFreeChapterList: chapterResponse.data, newFreeChapterLoading: false });
      } else {
        throw chapterResponse;
      }
    } catch (err) {
      this.setState({ newFreeChapterErrorList: err.data ? err.data : [], newFreeChapterLoading: false });
    }
  };

  loadNewChapterList = async language => {
    try {
      const chapterResponse = await callNonSecureApi(
        API_CHAPTER_URL + API_NEW_CHAPTER_URL + API_TOP_AND_RATE_FICTION_LANGUAGE_SUFFIX + language.join(),
        API_CALLING_METHOD.GET,
      );

      if (chapterResponse.result === RETURN_CODE_API_CALL_SUCCESS) {
        this.setState({ newChapterList: chapterResponse.data, newChapterLoading: false });
      } else {
        throw chapterResponse;
      }
    } catch (err) {
      this.setState({ newChapterErrorList: err.data ? err.data : [], newChapterLoading: false });
    }
  };

  loadTopChapterList = async language => {
    try {
      const chapterResponse = await callNonSecureApi(
        API_CHAPTER_URL + API_TOP_FICTION_URL + API_TOP_AND_RATE_FICTION_LANGUAGE_SUFFIX + language.join(),
        API_CALLING_METHOD.GET,
      );

      if (chapterResponse.result === RETURN_CODE_API_CALL_SUCCESS) {
        this.setState({ topChapterList: chapterResponse.data, topChapterLoading: false });
      } else {
        throw chapterResponse;
      }
    } catch (err) {
      this.setState({ topChapterErrorList: err.data ? err.data : [], topChapterLoading: false });
    }
  };

  loadNewFictionList = async language => {
    try {
      const fictionResponse = await callNonSecureApi(
        API_FICTION_URL + API_NEW_FICTION_URL + API_TOP_AND_RATE_FICTION_LANGUAGE_SUFFIX + language.join(),
        API_CALLING_METHOD.GET,
      );

      if (fictionResponse.result === RETURN_CODE_API_CALL_SUCCESS) {
        this.setState({ newFictionList: fictionResponse.data, newFictionListLoading: false });
      } else {
        throw fictionResponse;
      }
    } catch (err) {
      this.setState({ newFictionErrorList: err.data ? err.data : [], newFictionListLoading: false });
    }
  };

  loadTopFictionList = async language => {
    try {
      const fictionResponse = await callNonSecureApi(
        API_FICTION_URL + API_TOP_FICTION_URL + API_TOP_AND_RATE_FICTION_LANGUAGE_SUFFIX + language.join(),
        API_CALLING_METHOD.GET,
      );
      if (fictionResponse.result === RETURN_CODE_API_CALL_SUCCESS) {
        this.setState({ topFictionList: fictionResponse.data, topFictionListLoading: false });
      } else {
        throw fictionResponse;
      }
    } catch (err) {
      this.setState({ topFictionErrorList: err.data ? err.data : [], topFictionListLoading: false });
    }
  };

  loadNews = async () => {
    try {
      const response = await callNonSecureApi(NEWS_URL, API_CALLING_METHOD.GET);
      if (response.result === RETURN_CODE_API_CALL_SUCCESS) {
        this.setState({ news: response.data });
      } else {
        throw response;
      }
    } catch (err) {
      // do nothing, just not display news
    }
  };

  render() {
    const { t, i18n } = this.props;
    return (
      <React.Fragment>
        <Helmet title={t('home:home-title')} />
        <div className="row">
          <div className="col-lg-8">
            <div className="card mb-3">
              <h6 className="card-header text-center">
                <span className="fas fa-list fa-fw " /> {t('home:home-last-updates')}
              </h6>
              <div className="card-header p-0">
                <ul className="nav nav-pills nav-justified" role="tablist">
                  <li className="nav-item">
                    <a
                      className="nav-link active show"
                      data-toggle="tab"
                      onClick={e => {
                        e.preventDefault();
                        this.switchFictionTab('all');
                      }}
                    >
                      {t('home:home-all')}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      data-toggle="tab"
                      onClick={e => {
                        e.preventDefault();
                        this.switchFictionTab('freeFiction');
                      }}
                    >
                      {t('home:home-free-fictions')}
                    </a>
                  </li>
                </ul>
              </div>

              <div className="tab-content">
                <div role="tabpanel" className={this.state.fictionListTab === 'all' ? 'tab-pane active show' : 'tab-pane'} id="all">
                  <div className="row m-0">
                    <Loading loading={this.state.topChapterLoading} t={t} />
                    {Array.isArray(this.state.newChapterList)
                      ? this.state.newChapterList.map((chapterItem, key) => <FictionCard chapter={chapterItem} t={t} key={'new' + key} />)
                      : ''}
                  </div>
                </div>

                <div
                  role="tabpanel"
                  className={this.state.fictionListTab === 'freeFiction' ? 'tab-pane active show' : 'tab-pane'}
                  id="follows_update"
                >
                  <div className="row m-0">
                    <Loading loading={this.state.newFreeChapterLoading} t={t} />
                    {Array.isArray(this.state.newFreeChapterList)
                      ? this.state.newFreeChapterList.map((chapterItem, key) => (
                          <FictionCard chapter={chapterItem} t={t} key={'free' + key} />
                        ))
                      : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <NewsCard newsList={this.state.news} t={this.props.t} lng={i18n.language} />
            <div className="card mb-3">
              <h6 className="card-header text-center">
                <span className="fas fa-external-link-alt fa-fw " /> {t('home:home-top-chapter')}
              </h6>

              <div className="tab-content">
                <Loading loading={this.state.topChapterLoading} t={t} />
                {Array.isArray(this.state.topChapterList)
                  ? this.state.topChapterList.map((chapterItem, key) => (
                      <ul className="list-group list-group-flush" key={'top-chapter-' + key}>
                        <TopChapterItem t={t} chapter={chapterItem} />
                      </ul>
                    ))
                  : ''}
              </div>
            </div>
          </div>
        </div>
        <FeatureCarousel fictionList={this.state.topFictionList} t={t} loading={this.state.topFictionListLoading} lng={i18n.language} />
        <NewTitleCarousel fictionList={this.state.newFictionList} t={t} loading={this.state.newFictionListLoading} lng={i18n.language} />
      </React.Fragment>
    );
  }
}

Homepage.propTypes = {
  t: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  rehydrated: PropTypes.bool,
  i18n: PropTypes.object,
};

const stateToProps = ({ user, _persist }) => ({
  currentUser: user.user,
  rehydrated: _persist.rehydrated,
});
const dispatchToProps = {};

export default connect(
  stateToProps,
  dispatchToProps,
)(withTranslation(['common', 'home'])(Homepage));
