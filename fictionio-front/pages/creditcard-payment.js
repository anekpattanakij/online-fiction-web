import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withTranslation } from '../i18n';
import { createChargeToken } from '../redux-saga/action/paymentAction';
import CreditCardPaymentForm from '../components/formComponents/CreditCardPaymentForm';
import { withRouter } from 'next/router';
import securePageWrapper from '../hoc/securePageWrapper';
import '../static/css/blank.css';

class CreditCardPayment extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'credit-card-payment'],
    };
  }

  componentDidMount() {
    if (this.props.price === 0 || this.props.amount === 0 || this.props.channel !== 'creditCard') this.props.router.push('/coin-purchase');
  }
  render() {
    const { t } = this.props;
    return (
      <div className="container" role="main" id="content">
        <Helmet title={t('credit-card-payment:title')} />
        <CreditCardPaymentForm {...this.props} />
      </div>
    );
  }
}

CreditCardPayment.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
  createChargeToken: PropTypes.func.isRequired,
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
  result: payment.topupOnlineSuccess,
});
const dispatchToProps = {
  createChargeToken,
};

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation('credit-card-payment')(securePageWrapper(CreditCardPayment))));
