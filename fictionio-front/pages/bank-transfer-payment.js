import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withTranslation } from '../i18n';
import { saveBankTransferRequest } from '../redux-saga/action/paymentAction';
import BankTransferPaymentForm from '../components/formComponents/BankTransferPaymentForm';
import { withRouter } from 'next/router';
import securePageWrapper from '../hoc/securePageWrapper';
import '../static/css/blank.css';

class BankTransferPayment extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'bank-transfer-payment'],
    };
  }
  componentDidMount() {
    if (this.props.price === 0 || this.props.amount === 0 || this.props.channel !== 'bankTransfer') this.props.router.push('/coin-purchase');
  }

  render() {
    const { t } = this.props;
    return (
      <div className="container" role="main" id="content">
        <Helmet title={t('bank-transfer-payment:title')} />
        <BankTransferPaymentForm {...this.props} />
      </div>
    );
  }
}

BankTransferPayment.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
  saveBankTransferRequest: PropTypes.func.isRequired,
  channel: PropTypes.string,
  price: PropTypes.number,
  amount: PropTypes.number,
  bonus: PropTypes.number,
  currency: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.array,
  result: PropTypes.bool,
};

const stateToProps = ({ user, payment }) => ({
  currentUser: user.user,
  channel: payment.paymentChannel,
  price: payment.topupPrice,
  amount: payment.topupAmount,
  bonus: payment.topupBonus,
  currency: payment.topupCurrency,
  loading: payment.loading,
  error: payment.errorList,
  result: payment.topupSuccess,
});
const dispatchToProps = {
  saveBankTransferRequest,
};

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation('bank-transfer-payment')(securePageWrapper(BankTransferPayment))));
