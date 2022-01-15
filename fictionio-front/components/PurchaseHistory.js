import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '../i18n';
import ReactSVG from 'react-svg';
import { generateStaticPath } from '../util/staticPathUtil';
import * as moment from 'moment';
import Config from '../config/index';
import Loading from './Loading';
import { API_CALLING_METHOD, callSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../common/ApiPortal';

class PurchaseHistory extends React.Component {
  state = {
    purchaseChapterList: null,
    purchaseChapterLoading: true,
    purchaseChapterFail: false,
    purchaseChapterErrorList: null,
  };

  componentDidUpdate() {
    if (this.props.loadedPurchaseHistory === true && this.state.purchaseChapterList === null) {
      try {
        callSecureApi(
          this.props.sessionTimeout,
          this.props.updateAccessToken,
          this.props.user,
          Config.apiPath + '/user/purchase',
          API_CALLING_METHOD.GET,
        ).then(chapterResponse => {
          if (chapterResponse.result === RETURN_CODE_API_CALL_SUCCESS) {
            this.setState({ purchaseChapterList: chapterResponse.data.result, purchaseChapterLoading: false });
          } else {
            this.setState({ purchaseChapterFail: true, purchaseChapterLoading: false });
          }
        });
      } catch (err) {
        this.setState({ purchaseChapterErrorList: err.data ? err.data : [], purchaseChapterLoading: false });
      }
    }
  }

  render() {
    const { t } = this.props;
    return this.state.purchaseChapterLoading ? (
      <div className="tab-content">
        <div className="no-chapter-container text-center">
          <Loading loading={this.state.purchaseChapterLoading} t={t} />
        </div>
      </div>
    ) : this.state.purchaseChapterFail ? (
      <div className="no-chapter-container text-center">{t('coin-purchase:purchase-chapter-load-fail')}</div>
    ) : this.state.purchaseChapterList && this.state.purchaseChapterList.length > 0 ? (
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
              </div>
            </div>
          </div>
          {this.state.purchaseChapterList.map((chapterItem, key) => (
            <div key={key} className="chapter-row d-flex row no-gutters p-2 align-items-center border-bottom odd-row">
              <div className="col col-lg-5 row no-gutters pr-1 order-lg-2">
                <Link href={'/chapter?chapter=' + chapterItem.chapter} as={'/chapter/' + chapterItem.chapter}>
                  <a>
                    {t('coin-purchase:chapter')} {chapterItem.displayChapterNumber} - {chapterItem.chapterName}
                  </a>
                </Link>
              </div>
              <div className="col-2 col-lg-2 ml-1 text-right order-lg-8">{moment(chapterItem.purchaseDate).fromNow()} </div>
              <div className="w-100 d-lg-none" />
              <div className="col-auto text-center order-lg-4" style={{ flex: '0 0 2.5em' }}>
                <ReactSVG
                  className="flag-icon"
                  src={generateStaticPath('/img/flag/' + ('' + chapterItem.language).toLowerCase() + '.svg')}
                />
              </div>
              <div className="col order-lg-5">{chapterItem.coin}</div>
              <div className="col-auto col-lg-1 text-right mx-1 order-lg-6">
                <Link
                  href={'/user?user=' + (chapterItem && chapterItem.authorCif ? chapterItem.authorCif : '')}
                  as={
                    '/user/' +
                    (chapterItem && chapterItem.authorCif ? chapterItem.authorCif + '/' + encodeURI(chapterItem.authorDisplayName) : '')
                  }
                >
                  <a>{chapterItem.authorDisplayName ? chapterItem.authorDisplayName : ''}</a>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="tab-content">
        <div className="no-chapter-container text-center">{t('coin-purchase:no-purchase-chapter')}</div>
      </div>
    );
  }
}

PurchaseHistory.propTypes = {
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  loadedPurchaseHistory: PropTypes.bool,
  user: PropTypes.object,
  t: PropTypes.func,
};

export default PurchaseHistory;
