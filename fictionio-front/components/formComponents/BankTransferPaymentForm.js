import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'react-final-form';
import { compose } from 'recompose';
import { getErrorMessage, required } from '../../common/Validator';
import CoinIcon from '../CoinIcon';

const AMOUNT_MAX_LENGTH = 16;
const DATE_MAX_LENGTH = 10;
const TIME_MAX_LENGTH = 10;
const REFERENCE_NUMBER_MAX_LENGTH = 20;

class BankTransferPaymentForm extends React.Component {
  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.submitBankTransfer = this.submitBankTransfer.bind(this);
  }

  submitBankTransfer(values) {
    this.props.saveBankTransferRequest(
      this.props.sessionTimeout,
      this.props.updateAccessToken,
      this.props.currentUser,
      values.transferAmount,
      values.transferDate,
      values.transferTime,
      values.transferReferenceNumber,
    );
  }

  validate() {
    const errors = {};
    return errors;
  }

  render() {
    const { t } = this.props;
    return (
      <div className="mx-auto form-narrow" id="login_container">
        <Form
          onSubmit={this.submitBankTransfer}
          validate={this.validate}
          render={({ handleSubmit, invalid, submitting }) => (
            <form onSubmit={handleSubmit} id="login_form">
              {this.props.errorList
                ? this.props.errorList.map((errorMessage, i) => (
                    <div className="alert alert-danger" role="alert" key={'error' + i}>
                      {errorMessage && errorMessage.code ? t('common:' + errorMessage.code) : ''}
                    </div>
                  ))
                : ''}
              <h1 className="text-center">{t('bank-transfer-payment:bank-transfer')}</h1>
              <hr />
              <Field
                name="transferAmount"
                validate={compose(
                  getErrorMessage(t, 'common:error.ERR_FIELD_REQUIRED', 'bank-transfer-payment:bank-transfer-amount'),
                  required,
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group">
                    <label htmlFor="bank_transfer_amount" className="sr-only">
                      {t('bank-transfer-payment:bank-transfer-amount')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Alphanumeric characters only."
                      type="text"
                      className="form-control"
                      placeholder={t('bank-transfer-payment:bank-transfer-amount')}
                      maxLength={AMOUNT_MAX_LENGTH}
                      required
                    />
                    <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                  </div>
                )}
              </Field>

              <Field
                name="transferDate"
                validate={compose(
                  getErrorMessage(t, 'common:error.ERR_FIELD_REQUIRED', 'bank-transfer-payment:bank-transfer-date'),
                  required,
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group">
                    <label htmlFor="bank_transfer_date" className="sr-only">
                      {t('bank-transfer-payment:bank-transfer-date')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Minimum length: 8 characters."
                      type="password"
                      className="form-control"
                      placeholder={t('bank-transfer-payment:bank-transfer-date')}
                      maxLength={DATE_MAX_LENGTH}
                      required
                    />
                    <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                  </div>
                )}
              </Field>
              <Field
                name="transferTime"
                validate={compose(
                  getErrorMessage(t, 'common:error.ERR_FIELD_REQUIRED', 'bank-transfer-payment:bank-transfer-time'),
                  required,
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group">
                    <label htmlFor="bank_transfer_time" className="sr-only">
                      {t('bank-transfer-payment:bank-transfer-time')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Minimum length: 8 characters."
                      type="password"
                      className="form-control"
                      placeholder={t('bank-transfer-payment:bank-transfer-time')}
                      maxLength={TIME_MAX_LENGTH}
                      required
                    />
                    <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                  </div>
                )}
              </Field>
              <Field
                name="transferReferenceNumber"
                validate={compose(
                  getErrorMessage(t, 'common:error.ERR_FIELD_REQUIRED', 'bank-transfer-payment:bank-transfer-reference-number'),
                  required,
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group">
                    <label htmlFor="bank_transfer_reference-number" className="sr-only">
                      {t('bank-transfer-payment:bank-transfer-reference-number')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Minimum length: 8 characters."
                      type="password"
                      className="form-control"
                      placeholder={t('bank-transfer-payment:bank-transfer-reference-number')}
                      maxLength={REFERENCE_NUMBER_MAX_LENGTH}
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
                      <th className="w-60">{t('bank-transfer-payment:total-coin')}</th>
                      <th className="w-auto">{t('bank-transfer-payment:total-price')}</th>
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

              <div className="col-lg-12 col-12">
                <span>{t('bank-transfer-payment:bank-transfer-time-agreement')}</span>
              </div>

              <button className="btn btn-lg btn-info btn-block" type="submit" id="signup_button" disabled={invalid || submitting}>
                <span className="fas fa-sign-in-alt fa-fw" /> <span className="fas fa-shopping-cart fa-fw" />{' '}
                {t('bank-transfer-payment:purchase')}
              </button>
            </form>
          )}
        />
      </div>
    );
  }
}

BankTransferPaymentForm.propTypes = {
  t: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  saveBankTransferRequest: PropTypes.func,
  currentUser: PropTypes.object,
  errorList: PropTypes.array,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  price: PropTypes.number,
  amount: PropTypes.number,
  bonus: PropTypes.number,
  currency: PropTypes.string,
};

export default BankTransferPaymentForm;
