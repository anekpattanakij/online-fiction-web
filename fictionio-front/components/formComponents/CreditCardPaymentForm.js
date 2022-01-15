import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'react-final-form';
import { compose } from 'recompose';
import { getErrorMessage, required } from '../../common/Validator';
import CoinIcon from '../CoinIcon';

const CREDIT_CARD_NUMBER_MAX_LENGTH = 16;
const CREDIT_CARD_CVV_MAX_LENGTH = 3;

class CreditCardPaymentForm extends React.Component {
  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.submitCreateChargeToken = this.submitCreateChargeToken.bind(this);
  }

  validate() {
    const errors = {};
    return errors;
  }

  submitCreateChargeToken(values) {
    this.props.createChargeToken(
      this.props.sessionTimeout,
      this.props.updateAccessToken,
      this.props.currentUser,
      values.cardHolderName,
      values.cardNumber,
      ('' + values.cardExpiryDate).split('/')[0],
      ('' + values.cardExpiryDate).split('/')[1],
      values.cardCvv,
      this.props.price,
      this.props.currency,
    );
  }

  render() {
    const { t } = this.props;
    return (
      <div className="mx-auto form-narrow" id="credit_card_payment_container">
        <Form
          onSubmit={this.submitCreateChargeToken}
          validate={this.validate}
          render={({ handleSubmit, invalid, submitting }) => (
            <form onSubmit={handleSubmit} id="credit_card_payment_form">
              {this.props.errorList
                ? this.props.errorList.map((errorMessage, i) => (
                    <div className="alert alert-danger" role="alert" key={'error' + i}>
                      {errorMessage && errorMessage.code ? t('common:' + errorMessage.code) : ''}
                    </div>
                  ))
                : ''}
              <h1 className="text-center">{t('credit-card-payment:creditcard-payment')}</h1>
              <hr />
              <Field
                name="cardNumber"
                validate={compose(
                  getErrorMessage(t, 'common:error.ERR_FIELD_REQUIRED', 'credit-card-payment:creditcard-number'),
                  required,
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group">
                    <label htmlFor="creditcard_number" className="sr-only">
                      {t('credit-card-payment:creditcard-number')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Alphanumeric characters only."
                      type="text"
                      className="form-control"
                      placeholder={t('credit-card-payment:creditcard-number')}
                      maxLength={CREDIT_CARD_NUMBER_MAX_LENGTH}
                      required
                    />
                    <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                  </div>
                )}
              </Field>

              <Field
                name="cardExpiryDate"
                validate={compose(
                  getErrorMessage(t, 'common:error.ERR_FIELD_REQUIRED', 'credit-card-payment:creditcard-expire-date'),
                  required,
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group">
                    <label htmlFor="creditcard_expiry_date" className="sr-only">
                      {t('credit-card-payment:creditcard-expire-date')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Date only."
                      type="text"
                      className="form-control"
                      placeholder={t('credit-card-payment:creditcard-expire-date')}
                      required
                    />
                    <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                  </div>
                )}
              </Field>
              <Field
                name="cardCvv"
                validate={compose(
                  getErrorMessage(t, 'common:error.ERR_FIELD_REQUIRED', 'credit-card-payment:creditcard-cvv'),
                  required,
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group">
                    <label htmlFor="creditcard_cvv" className="sr-only">
                      {t('credit-card-payment:creditcard-cvv')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Number only."
                      type="text"
                      className="form-control"
                      placeholder={t('credit-card-payment:creditcard-cvv')}
                      maxLength={CREDIT_CARD_CVV_MAX_LENGTH}
                      required
                    />
                    <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                  </div>
                )}
              </Field>
              <Field
                name="cardHolderName"
                validate={compose(
                  getErrorMessage(t, 'common:error.ERR_FIELD_REQUIRED', 'credit-card-payment:creditcard-holder-name'),
                  required,
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group">
                    <label htmlFor="creditcard_expiry_date" className="sr-only">
                      {t('credit-card-payment:creditcard-holder-name')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Date only."
                      type="text"
                      className="form-control"
                      placeholder={t('credit-card-payment:creditcard-holder-name')}
                      required
                    />
                    <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                  </div>
                )}
              </Field>
              <div className="col-12">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th className="w-60">{t('credit-card-payment:total-coin')}</th>
                      <th className="w-auto">{t('credit-card-payment:total-price')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <CoinIcon /> {this.props.amount} (+ {this.props.bonus})
                      </td>
                      <td className="mitr-medium">
                        {' '}
                        {this.props.price} {this.props.currency}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button
                className="btn btn-lg btn-info btn-block"
                type="submit"
                id="purchase_button"
                disabled={invalid || submitting || this.props.loading}
              >
                <span className="fas fa-shopping-cart fa-fw " /> {t('credit-card-payment:purchase')}
              </button>
            </form>
          )}
        />
      </div>
    );
  }
}

CreditCardPaymentForm.propTypes = {
  t: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  createChargeToken: PropTypes.func,
  currentUser: PropTypes.object,
  errorList: PropTypes.array,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  price: PropTypes.number,
  amount: PropTypes.number,
  bonus: PropTypes.number,
  currency: PropTypes.string,
};

export default CreditCardPaymentForm;
