import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import { withTranslation } from '../i18n';
import { connect } from 'react-redux';
import { API_CALLING_METHOD, callNonSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../common/ApiPortal';
import { API_SEARCH_URL } from '../redux-saga/saga/fictionSaga';
import Loading from '../components/Loading';
import Fiction from '../common/Fiction';
import { generateStaticPath, generateCoverPath } from '../util/staticPathUtil';
import ReactSVG from 'react-svg';
import { Link } from '../i18n';

class SearchResult extends React.Component {
  state = {
    loadingSearchRequest: true,
    currentSearchText: [],
    searchResult: [],
    errorList: [],
    firstSearch: true,
  };

  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'search-result'],
    };
  }

  componentDidUpdate() {
    // get chapter after rehydrate becuase need current user information
    this.checkLoadingWithProp(this.props);
  }

  componentDidMount() {
    this.checkLoadingWithProp(this.props);
  }

  checkLoadingWithProp = async currenrProps => {
    if (
      (this.state.firstSearch || !this.state.loadingSearchRequest) &&
      currenrProps.searchText &&
      currenrProps.searchText !== '' &&
      currenrProps.searchText !== this.state.currentSearchText
    ) {
      this.setState({
        firstSearch: false,
        currentSearchText: currenrProps.searchText,
        loadingSearchRequest: true,
      });

      this.loadNewSearchResultList(currenrProps.searchText);
    }
    if (currenrProps.searchText === '') {
      this.setState({
        loadingSearchRequest: false,
      });
    }
  };

  loadNewSearchResultList = async searchText => {
    try {
      const fictionResponse = await callNonSecureApi(API_SEARCH_URL, API_CALLING_METHOD.GET, { keyword: searchText });
      if (fictionResponse.result === RETURN_CODE_API_CALL_SUCCESS && fictionResponse.data) {
        this.setState({ searchResult: fictionResponse.data, loadingSearchRequest: false });
      } else {
        throw fictionResponse;
      }
    } catch (err) {
      this.setState({ searchResult: [], loadingSearchRequest: false, errorList: err.data ? err.data : [] });
    }
  };

  render() {
    const { t } = this.props;
    return (
      <React.Fragment>
        <Helmet title={t('search-result:title-search-result')} />
        <Loading loading={this.state.loadingSearchRequest && !this.state.firstSearch} t={t} />
        {!this.state.loadingSearchRequest ? (
          this.state.searchResult && this.state.searchResult.length == 0 ? (
            <div className="text-center">
              {' '}
              {t('search-result:no-result', {
                keyword: this.state.currentSearchText,
              })}
            </div>
          ) : (
            <div className="row mt-1 mx-0">
              {this.state.searchResult.map((fictionItem, itemIndex) => (
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
                    <Link
                      href={'/fiction?fiction=' + fictionItem.fictionId}
                      as={
                        '/fiction/' +
                        fictionItem.fictionId +
                        '/' +
                        encodeURI(Fiction.displayFictionName(fictionItem, this.props.i18n.language.toUpperCase()))
                      }
                    >
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
                      <span className="fas fa-star fa-fw " title="rating"></span> (<span >{fictionItem && fictionItem.rating.toFixed(2)}</span>)
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
          )
        ) : this.state.firstSearch ? (
          <div className="text-center">{t('search-result:first-search')}</div>
        ) : (
          ''
        )}
      </React.Fragment>
    );
  }
}

SearchResult.propTypes = {
  t: PropTypes.func.isRequired,
  searchText: PropTypes.string,
  i18n: PropTypes.object,
};

const stateToProps = ({ search }) => ({
  searchText: search.searchText,
});
const dispatchToProps = {};

export default connect(
  stateToProps,
  dispatchToProps,
)(withTranslation(['common', 'search-result'])(SearchResult));
