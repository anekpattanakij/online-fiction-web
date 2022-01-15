import React from 'react';
import PropTypes from 'prop-types';
import * as moment from 'moment';
import Config from '../config/index';
import Loading from './Loading';
import { API_CALLING_METHOD, callSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../common/ApiPortal';

class WithdrawHistory extends React.Component {
  state = {
    withdrawalList: null,
    withdrawalLoading: true,
    withdrawalFail: false,
    withdrawErrorList: null,
  };

  componentDidUpdate() {
    if (this.props.loadedWithdrawHistory === true && this.state.withdrawalList === null) {
      try {
        callSecureApi(
          this.props.sessionTimeout,
          this.props.updateAccessToken,
          this.props.user,
          Config.apiPath + '/user/withdraw',
          API_CALLING_METHOD.GET,
        ).then(withdrawResponse => {
          if (withdrawResponse && withdrawResponse.result === RETURN_CODE_API_CALL_SUCCESS) {
            this.setState({ withdrawalList: withdrawResponse.data.result, withdrawalLoading: false });
          } else {
            this.setState({ withdrawalFail: true, withdrawalLoading: false });
          }
        });
      } catch (err) {
        this.setState({ withdrawErrorList: err.data ? err.data : [], withdrawalLoading: false });
      }
    }
  }

  render() {
    const { t } = this.props;
    return this.state.withdrawalLoading ? (
      <div className="tab-content">
        <div className="no-chapter-container text-center">
          <Loading loading={this.state.withdrawalLoading} t={t} />
        </div>
      </div>
    ) : this.state.withdrawalFail ? (
      <div className="no-chapter-container text-center">{t('coin-purchase:withdraw-history-load-fail')}</div>
    ) : this.state.withdrawalList && this.state.withdrawalList.length > 0 ? (
      <div className="edit tab-content">
        <div className="chapter-container ">
          <div className="row no-gutters">
            <div className="col ">
              <div className="chapter-row d-flex row no-gutters p-2 align-items-center border-bottom odd-row">
                <div className="col col-lg-5 row no-gutters pr-1 order-lg-2">
                  <span className="far fa-vote-yea fa-fw "  title="Chapter" />
                </div>
                <div className="col-2 col-lg-2 ml-1 text-right order-lg-8">
                  <span className="far fa-clock fa-fw "  title="Age" />
                </div>
                <div className="w-100 d-lg-none" />
                <div className="col order-lg-5">
                  <span className="fas fa-dollar-sign fa-fw "  title="Coin" />
                </div>
                <div className="col-auto col-lg-1 text-right mx-1 order-lg-6">
                  <span className="fas fa-comment-alt fa-fw "  title="Author" />
                </div>
              </div>
            </div>
          </div>
          {this.state.withdrawalList.map((withdrawItem, key) => (
            <div key={key} className="chapter-row d-flex row no-gutters p-2 align-items-center border-bottom odd-row">
              <div className="col col-lg-5 row no-gutters pr-1 order-lg-2">{withdrawItem.withdrawChannel}</div>
              <div className="col-2 col-lg-2 ml-1 text-right order-lg-8">{moment(withdrawItem.requestDate).fromNow()} </div>
              <div className="w-100 d-lg-none" />
              <div className="col order-lg-5">
                {Number(withdrawItem.withdrawAmount).toFixed(2)} {withdrawItem.withdrawCurrency}
              </div>
              <div className="col-auto col-lg-1 text-right mx-1 order-lg-6">{t('coin-purchase:' + withdrawItem.result)}</div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="tab-content">
        <div className="no-chapter-container text-center">{t('coin-purchase:no-withdraw-history')}</div>
      </div>
    );
  }
}

WithdrawHistory.propTypes = {
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  loadedWithdrawHistory: PropTypes.bool,
  user: PropTypes.object,
  t: PropTypes.func,
};

export default WithdrawHistory;
