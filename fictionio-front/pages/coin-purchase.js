import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { withTranslation } from '../i18n';
import CoinIcon from '../components/CoinIcon';
import Loading from '../components/Loading';
import { connect } from 'react-redux';
import { preventNaNNumber } from '../util/converterUtil';
import { loadTopupPriceList } from '../redux-saga/action/topupPriceAction';
import { loadWithdrawRateList } from '../redux-saga/action/withdrawAction';
import { requestTopup } from '../redux-saga/action/paymentAction';
import { withRouter } from 'next/router';
import SecurePageWrapper from '../hoc/securePageWrapper';
import PurchaseHistory from '../components/PurchaseHistory';
import WithdrawHistory from '../components/WithdrawHistory';
import { sessionTimeout, updateAccessToken } from '../redux-saga/action/userAction';
import { API_CALLING_METHOD, callSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../common/ApiPortal';
import ReactSelect from 'react-select';
import Config from '../config/index';
import '../static/css/blank.css';

class CoinPurchase extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'coin-purchase'],
    };
  }

  state = {
    settingTab: 'purchaseMenu',
    paymentChannel: 'creditCard',
    withdrawChannel: 'paypal',
    priceByCreditCard: 0,
    amountByCreditCard: 0,
    bonusByCreditCard: 0,
    currencyByCreditCard: 'USD',
    priceByBankTransfer: 0,
    amountByBankTransfer: 0,
    bonusByBankTransfer: 0,
    currencyByBankTransfer: 'USD',
    loadedPurchaseHistory: false,
    loadedWithdrawHistory: false,
    withdrawAmount: 0,
    withdrawCurrency: 'USD',
    withdrawCurrencyList: [{ value: 'USD', label: 'USD' }],
    loadingWithdrawalRequest: false,
    withdrawalRequestResult: false,
    withdrawalRequestErrorList: [],
  };

  constructor(props) {
    super(props);
    this.switchSettingTab = this.switchSettingTab.bind(this);
    this.switchPaymentChannelTab = this.switchPaymentChannelTab.bind(this);
    this.switchWithdrawChannelTab = this.switchWithdrawChannelTab.bind(this);
    this.setSelectCreditCardPrice = this.setSelectCreditCardPrice.bind(this);
    this.setSelectedBankTransferPrice = this.setSelectedBankTransferPrice.bind(this);
    this.updateTopupRequest = this.updateTopupRequest.bind(this);
    this.submitWithdrawRequest = this.submitWithdrawRequest.bind(this);
    this.getSelectedRate = this.getSelectedRate.bind(this);
    this.getEstimateAmount = this.getEstimateAmount.bind(this);
  }

  componentDidMount() {
    if (!this.props.topupPriceLastRefresh) {
      this.props.loadTopupPriceList();
    }
    if (!this.props.withdrawRateLastRefresh) {
      this.props.loadWithdrawRateList();
    } else {
      const newList = [];
      this.props.rateList.map(rateItem => {
        newList.push({ value: (rateItem && rateItem.currency) || '', label: (rateItem && rateItem.currency) || '' });
      });
      this.setState({ withdrawCurrencyList: newList });
    }
  }

  static getDerivedStateFromProps(props) {
    // get chapter after rehydrate becuase need current user information
    const updateState = {};
    if (props.withdrawRateLastRefresh && Array.isArray(props.rateList) && props.rateList.length > 0) {
      const newList = [];
      props.rateList.map(rateItem => {
        newList.push({ value: (rateItem && rateItem.currency) || '', label: (rateItem && rateItem.currency) || '' });
      });
      updateState.withdrawCurrencyList = newList;
    }

    return updateState;
  }

  switchSettingTab = targetTab => {
    if (targetTab === 'purchaseHistory') {
      this.setState({ loadedPurchaseHistory: true });
    }
    if (targetTab === 'withdrawHistory') {
      this.setState({ loadedWithdrawHistory: true });
    }
    this.setState({ settingTab: targetTab });
  };

  switchPaymentChannelTab = targetTab => {
    this.setState({ paymentChannel: targetTab });
  };

  switchWithdrawChannelTab = targetTab => {
    this.setState({ withdrawChannel: targetTab });
  };

  setSelectCreditCardPrice = (price, amount, bonus, currency) => {
    this.setState({ priceByCreditCard: price, amountByCreditCard: amount, bonusByCreditCard: bonus, currencyByCreditCard: currency });
  };

  setSelectedBankTransferPrice = (price, amount, bonus, currency) => {
    this.setState({
      priceByBankTransfer: price,
      amountByBankTransfer: amount,
      bonusByBankTransfer: bonus,
      currencyByBankTransfer: currency,
    });
  };

  updateTopupRequest = () => {
    if (this.state.paymentChannel === 'bankTransfer') {
      this.props.requestTopup(
        this.state.paymentChannel,
        this.state.amountByBankTransfer,
        this.state.bonusByBankTransfer,
        this.state.priceByBankTransfer,
        this.state.currencyByBankTransfer,
      );
      this.props.router.push('/bank-transfer-payment');
    } else {
      this.props.requestTopup(
        this.state.paymentChannel,
        this.state.amountByCreditCard,
        this.state.bonusByCreditCard,
        this.state.priceByCreditCard,
        this.state.currencyByCreditCard,
      );
      this.props.router.push('/creditcard-payment');
    }
  };

  submitWithdrawRequest = () => {
    this.setState({ loadingWithdrawalRequest: true });
    callSecureApi(
      this.props.sessionTimeout,
      this.props.updateAccessToken,
      this.props.currentUser,
      Config.apiPath + '/withdraw',
      API_CALLING_METHOD.POST,
      {},
      { amount: this.state.withdrawAmount, currency: this.state.withdrawCurrency, channel: this.state.withdrawChannel },
    ).then(withdrawResponse => {
      if (withdrawResponse.result === RETURN_CODE_API_CALL_SUCCESS) {
        this.setState({ withdrawalRequestResult: true, loadingWithdrawalRequest: false });
      } else {
        this.setState({
          withdrawalRequestResult: false,
          withdrawalRequestErrorList: withdrawResponse.data,
          loadingWithdrawalRequest: false,
        });
      }
    });
  };

  getPriceListItem(channel) {
    if (this.props.priceList) {
      let returnItem = [];
      this.props.priceList.forEach(priceItem => {
        if (priceItem.channel === channel) {
          returnItem = priceItem.priceList;
        }
      });
      return returnItem;
    } else {
      return [];
    }
  }

  withdrawAmountChange(evt) {
    const withdrawAmount = evt.target.validity.valid ? evt.target.value : this.state.withdrawAmount;
    this.setState({ withdrawAmount: withdrawAmount });
  }

  withdrawCurrencyChange(evt) {
    this.setState({ withdrawCurrency: evt.value });
  }

  getSelectedRate = () => {
    let rate = 1;
    this.props.rateList.map(rateItem => {
      if (rateItem.currency === this.state.withdrawCurrency) {
        rate = rateItem.rate;
      }
    });
    return rate;
  };

  getEstimateAmount = () => {
    let amount = 1;
    this.props.rateList.map(rateItem => {
      if (rateItem.currency === this.state.withdrawCurrency) {
        amount = rateItem.rate * this.state.withdrawAmount;
      }
    });
    return amount;
  };

  render() {
    const { t, currentUser } = this.props;
    return (
      <React.Fragment>
        <Helmet title={t('title')} />
        <div className="recharge-box-section">
          <div className="recharge-box">
            <article className="recharge-coin">
              <p>{currentUser && currentUser.displayName} </p>
              <p>
                {t('total-coin')} <CoinIcon />{' '}
                {preventNaNNumber(currentUser && currentUser.coin) +
                  preventNaNNumber(currentUser && currentUser.totalIncomeAsAuthor) +
                  preventNaNNumber(currentUser && currentUser.totalIncomeFromTranslated)}
              </p>
            </article>
            <div className="recharge-item-group">
              <article className="recharge-detail">
                <p className="coin-detail">{t('purchased-coin')} </p>

                <p>
                  <CoinIcon />
                  <span className="text"> {preventNaNNumber(currentUser && currentUser.coin)} </span>
                </p>
              </article>
              <article className="recharge-detail">
                <p className="coin-detail">{t('writer-coin')} </p>

                <p>
                  <CoinIcon />
                  <span className="text"> {preventNaNNumber(currentUser && currentUser.totalIncomeAsAuthor)} </span>
                </p>
              </article>
              <article className="recharge-detail">
                <p className="coin-detail">{t('translate-coin')}</p>

                <p>
                  <CoinIcon />
                  <span className="text"> {preventNaNNumber(currentUser && currentUser.totalIncomeFromTranslated)} </span>
                </p>
              </article>
            </div>
          </div>
        </div>
        <p className="notice-charge">
          <span>{t('withdraw-discliamer')}</span>
        </p>
        <ul className="nav nav-tabs mb-3 " role="tablist">
          <li className={this.state.settingTab === 'purchaseMenu' ? 'nav-item active show' : 'nav-item'}>
            <a
              className="nav-link"
              data-toggle="tab"
              onClick={e => {
                e.preventDefault();
                this.switchSettingTab('purchaseMenu');
              }}
            >
              <span className="fas fa-home fa-fw " title="Purchase Coin" /> <span className="d-none d-lg-inline">{t('top-up-coin')}</span>
            </a>
          </li>
          <li className={this.state.settingTab === 'purchaseHistory' ? 'nav-item active show' : 'nav-item'}>
            <a
              className="nav-link "
              data-toggle="tab"
              onClick={e => {
                e.preventDefault();
                this.switchSettingTab('purchaseHistory');
              }}
            >
              <span className="fas fa-history fa-fw " title="Topup History" />{' '}
              <span className="d-none d-lg-inline">{t('topup-history')}</span>
            </a>
          </li>
          <li className={this.state.settingTab === 'coinWithdrawal' ? 'nav-item active show' : 'nav-item'}>
            <a
              className="nav-link "
              data-toggle="tab"
              onClick={e => {
                e.preventDefault();
                this.switchSettingTab('coinWithdrawal');
              }}
            >
              <span className="fas fa-money-bill-wave fa-fw " title="Coin withdrawal" />{' '}
              <span className="d-none d-lg-inline">{t('coin-withdrawal')}</span>
            </a>
          </li>
          <li className={this.state.settingTab === 'withdrawHistory' ? 'nav-item active show' : 'nav-item'}>
            <a
              className="nav-link "
              data-toggle="tab"
              onClick={e => {
                e.preventDefault();
                this.switchSettingTab('withdrawHistory');
              }}
            >
              <span className="fas fa-vote-yea fa-fw " title="Withdraw History" />{' '}
              <span className="d-none d-lg-inline">{t('withdraw-history')}</span>
            </a>
          </li>
        </ul>

        <div className="tab-content">
          <div
            role="tabpanel"
            id="payment-pays"
            className={this.state.settingTab === 'purchaseMenu' ? 'tab-pane fade active show' : 'tab-pane fade'}
          >
            <div className="payment-box">
              <div className="payment-box-body">
                <div className="payment-supplier ">
                  <div className="pbox">
                    <div>
                      <h5>{t('payment')}</h5>
                    </div>
                    <div className="pbox-content">
                      <ul className="supplier-list">
                        <li className="payment-supplier-list">
                          <input
                            type="radio"
                            name="chgProduct"
                            id="credit_card"
                            value="credit_card"
                            defaultChecked
                            onClick={() => {
                              this.switchPaymentChannelTab('creditCard');
                            }}
                          />
                          <label htmlFor="credit_card">
                            <span>
                              <span />
                            </span>
                            {t('credit-card')}
                          </label>
                          <p>{t('credit-card-list')}</p>
                        </li>

                        <li className="payment-supplier-list">
                          <input
                            type="radio"
                            name="chgProduct"
                            id="internet_banking"
                            value="internet_banking"
                            onClick={() => {
                              this.switchPaymentChannelTab('bankTransfer');
                            }}
                          />
                          <label htmlFor="internet_banking">
                            <span>
                              <span />
                            </span>
                            {t('bank-transfer')}
                          </label>
                          <p />
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="payment-detail">
                  <div
                    id="detail-credit_card"
                    className="pbox"
                    style={this.state.paymentChannel === 'creditCard' ? { display: 'block' } : { display: 'none' }}
                  >
                    <div>
                      <h5 style={{ display: 'inline' }}>{t('credit-card')}</h5>
                      <span>{t('credit-card-list')}</span>
                    </div>
                    <Loading loading={this.props.loading} t={this.props.t} />
                    <div className="pbox-content">
                      <ul>
                        {this.props.priceList
                          ? this.props.priceList.map(priceChannel =>
                              priceChannel.channel === 'CC'
                                ? priceChannel.priceList.map((priceItem, indexItem) => (
                                    <li className="payment-option-list" key={'credit-card-payment-option' + indexItem}>
                                      <input
                                        type="radio"
                                        name="pays"
                                        id="pays-credit-card-option"
                                        value={priceItem.tokenAmount}
                                        onClick={() =>
                                          this.setSelectCreditCardPrice(
                                            priceItem.price,
                                            priceItem.tokenAmount,
                                            priceItem.bonusAmount,
                                            priceItem.currency,
                                          )
                                        }
                                      />
                                      <label className="paysbuy-detail" htmlFor="pays-credit-card-option">
                                        {priceItem.tokenAmount} {priceItem.bonusAmount > 0 ? '+ ' + priceItem.bonusAmount : ''} Coins
                                        <strong className="text-eq"> = </strong>
                                        <strong className="text-coin">
                                          {priceItem.price} {priceItem.currency}
                                        </strong>
                                      </label>
                                    </li>
                                  ))
                                : '',
                            )
                          : ''}
                      </ul>
                    </div>
                  </div>

                  <div
                    id="detail-credit_card"
                    className="pbox"
                    style={this.state.paymentChannel === 'bankTransfer' ? { display: 'block' } : { display: 'none' }}
                  >
                    <div>
                      <h5 style={{ display: 'inline' }}>{t('bank-transfer')}</h5>
                    </div>
                    <Loading loading={this.props.loading} t={this.props.t} />
                    <div className="pbox-content">
                      <ul>
                        {this.props.priceList
                          ? this.props.priceList.map(priceChannel =>
                              priceChannel.channel === 'BT'
                                ? priceChannel.priceList.map((priceItem, indexItem) => (
                                    <li className="payment-option-list" key={'credit-card-payment-option' + indexItem}>
                                      <input
                                        type="radio"
                                        name="pays"
                                        id="pays-bank-transfer-option"
                                        value={priceItem.tokenAmount}
                                        onClick={() =>
                                          this.setSelectedBankTransferPrice(
                                            priceItem.price,
                                            priceItem.tokenAmount,
                                            priceItem.bonusAmount,
                                            priceItem.currency,
                                          )
                                        }
                                      />
                                      <label className="paysbuy-detail" htmlFor="pays-CREDIT_W_OMISE_400">
                                        {priceItem.tokenAmount} {priceItem.bonusAmount > 0 ? '+ ' + priceItem.bonusAmount : ''} Coins
                                        <strong className="text-eq"> = </strong>
                                        <strong className="text-coin">
                                          {priceItem.price} {priceItem.currency}
                                        </strong>
                                      </label>
                                    </li>
                                  ))
                                : '',
                            )
                          : ''}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="payment-detail payment-detail-child" />
              </div>
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="btn btn-primary"
                id="buy_coin_button"
                onClick={e => {
                  e.preventDefault();
                  this.updateTopupRequest();
                }}
              >
                <span className="fas fa-shopping-cart fa-fw " /> {t('coin-purchase:buy')}
              </button>
            </div>
            <div className="payment-box">
              <div className="payment-note">
                <div>
                  <h5>{t('refund-header')}</h5>
                </div>
                <div className="pbox-content pay-note-detail">
                  {t('refund-bullet1')}
                  <br />
                  {t('refund-bullet2')}
                </div>
              </div>
            </div>
          </div>
          <div
            role="tabpanel"
            id="purchase-history"
            className={this.state.settingTab === 'purchaseHistory' ? 'tab-pane fade active show' : 'tab-pane fade'}
          >
            <PurchaseHistory
              t={t}
              user={this.props.currentUser}
              loadedPurchaseHistory={this.state.loadedPurchaseHistory}
              sessionTimeout={this.props.sessionTimeout}
              updateAccessToken={this.props.updateAccessToken}
            />
          </div>
          <div
            role="tabpanel"
            id="coin-withdrawal"
            className={this.state.settingTab === 'coinWithdrawal' ? 'tab-pane fade active show' : 'tab-pane fade'}
          >
            <div className="withdrawal-box">
              <div className="withdrawal-box-body">
                <div className="withdrawal-supplier ">
                  <div className="pbox">
                    <div>
                      <h5>{t('withdrawal')}</h5>
                    </div>
                    <div className="pbox-content">
                      <ul className="supplier-list">
                        <li className="withdrawal-supplier-list">
                          <input
                            type="radio"
                            name="chgProduct"
                            id="credit_card"
                            value="credit_card"
                            defaultChecked
                            onClick={() => {
                              this.switchWithdrawChannelTab('paypal');
                            }}
                          />
                          <label htmlFor="paypal">
                            <span>
                              <span />
                            </span>
                            {t('paypal')}
                          </label>
                        </li>

                        <li className="withdrawal-supplier-list">
                          <input
                            type="radio"
                            name="chgProduct"
                            id="transfer_to_bank"
                            value="transfer_to_bank"
                            onClick={() => {
                              this.switchWithdrawChannelTab('bankTransfer');
                            }}
                          />
                          <label htmlFor="transfer_to_bank">
                            <span>
                              <span />
                            </span>
                            {t('receive-bank-transfer')}
                          </label>
                          <p>{t('thai-bank-only')}</p>
                          <p />
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="withdrawal-detail">
                  <Loading loading={this.state.loadingWithdrawalRequest} t={t} />
                  {!this.state.loadingWithdrawalRequest ? (
                    this.state.withdrawalRequestResult ? (
                      <div id="withdraw-request" className="pbox" style={{ display: 'block' }}>
                        <div className="alert alert-success text-center" role="alert">
                          {t('withdraw-success')}
                        </div>
                      </div>
                    ) : (
                      <div id="detail-paypal" className="pbox" style={{ display: 'block' }}>
                        <div>
                          <h5 style={{ display: 'inline' }}>
                            {this.state.withdrawChannel === 'paypal' ? t('paypal') : t('receive-bank-transfer')}
                          </h5>
                        </div>
                        <div className="pbox-content">
                          <ul>
                            <li className="withdrawal-option-list" htmlFor="coin-amount">
                              {' '}
                              {t('coin-amount')} ({t('maximum-amount')} {(currentUser && currentUser.withdrawableCoin) || 0}{' '}
                              {t('maximum-amount')}) :
                              <input
                                type="text"
                                className="form-control"
                                pattern="[0-9]*"
                                id="coin-amount"
                                onChange={this.withdrawAmountChange.bind(this)}
                                value={this.state.withdrawAmount}
                              />
                            </li>
                            <li className="withdrawal-option-list" htmlFor="withdraw-currency">
                              {' '}
                              {t('withdraw-currency')} :
                              <ReactSelect
                                className="basic-single"
                                classNamePrefix="select"
                                defaultValue={this.state.withdrawCurrency}
                                id="withdraw-currency"
                                name="color"
                                options={this.state.withdrawCurrencyList}
                                onChange={this.withdrawCurrencyChange.bind(this)}
                              />
                            </li>
                            <li className="withdrawal-option-list">
                              {' '}
                              {t('rate')} (1 {t('coin')} = {this.getSelectedRate()} {this.state.withdrawCurrency})
                            </li>
                            {this.state.withdrawChannel === 'paypal' ? (
                              <li className="withdrawal-option-list"> {t('paypal-charge')}</li>
                            ) : (
                              ''
                            )}
                            {this.state.withdrawChannel === 'paypal' ? (
                              <li className="withdrawal-option-list"> {t('paypal-remark')}</li>
                            ) : (
                              <li className="withdrawal-option-list"> {t('bank-withdraw-remark')}</li>
                            )}
                            <li className="withdrawal-option-list">
                              {' '}
                              {t('estimate-receive')} :{' '}
                              {(this.getEstimateAmount() * (this.state.withdrawChannel === 'paypal' ? 0.95 : 1)).toFixed(2)}{' '}
                              {this.state.withdrawCurrency}{' '}
                            </li>
                          </ul>
                        </div>
                      </div>
                    )
                  ) : (
                    ''
                  )}
                </div>
                <div className="withdrawal-detail withdrawal-detail-child" />
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="btn btn-primary"
                  id="withdraw_coin_button"
                  onClick={e => {
                    e.preventDefault();
                    this.submitWithdrawRequest();
                  }}
                >
                  <span className="fas fa-money-bill-wave fa-fw " /> {t('coin-purchase:withdraw')}
                </button>
              </div>
              <div className="withdraw-box">
                <div className="withdraw-note">
                  <div>
                    <h5>{t('withdraw-disclaimer-header')}</h5>
                  </div>
                  <div className="pbox-content withdraw-note-detail">{t('withdraw-bullet1')}</div>
                  <div className="pbox-content withdraw-note-detail">{t('withdraw-bullet2')}</div>
                </div>
              </div>
            </div>
          </div>
          <div
            role="tabpanel"
            id="withdraw-history"
            className={this.state.settingTab === 'withdrawHistory' ? 'tab-pane fade active show' : 'tab-pane fade'}
          >
            <WithdrawHistory
              t={t}
              user={this.props.currentUser}
              loadedWithdrawHistory={this.state.loadedWithdrawHistory}
              sessionTimeout={this.props.sessionTimeout}
              updateAccessToken={this.props.updateAccessToken}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

CoinPurchase.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
  errorList: PropTypes.array,
  currentUser: PropTypes.object,
  loading: PropTypes.bool,
  priceList: PropTypes.array,
  loadTopupPriceList: PropTypes.func,
  requestTopup: PropTypes.func,
  loadWithdrawRateList: PropTypes.func,
  topupPriceLastRefresh: PropTypes.any,
  rateList: PropTypes.any,
  withdrawRateLastRefresh: PropTypes.any,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  rehydrated: PropTypes.bool,
};

const stateToProps = ({ user, topupPrice, withdrawRate, _persist }) => ({
  currentUser: user.user,
  errorList: topupPrice.errorList,
  loading: topupPrice.loading,
  priceList: topupPrice.topupPriceList,
  topupPriceLastRefresh: topupPrice.lastRefresh,
  rateList: withdrawRate.rateList,
  withdrawRateLastRefresh: withdrawRate.lastRefresh,
  rehydrated: _persist.rehydrated,
});

const dispatchToProps = { loadTopupPriceList, loadWithdrawRateList, requestTopup, sessionTimeout, updateAccessToken };

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(SecurePageWrapper(withTranslation('coin-purchase')(CoinPurchase))));
