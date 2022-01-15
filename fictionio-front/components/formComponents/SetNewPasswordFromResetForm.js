import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'react-final-form';
import { compose } from 'recompose';
import { composeValidators, getErrorMessage, required, isLengthBetween } from '../../common/Validator';
import { PASSWORD_MAX, PASSWORD_MIN } from '../../config/fieldLength';

class SetNewPasswordFromResetForm extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'set-new-password'],
    };
  }

  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.submitResetPassword = this.submitResetPassword.bind(this);
  }

  submitResetPassword(values) {
    this.props.setPasswordFromReset(this.props.userEmail, this.props.resetToken, values.password);
  }

  validate(values) {
    const errors = {};
    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = this.props.t('common:password-mismatch');
    }
    return errors;
  }

  render() {
    const { t } = this.props;
    return (
      <div className="mx-auto form-narrow" id="setnewpassword_container">
        <Form
          onSubmit={this.submitResetPassword}
          validate={this.validate}
          render={({ handleSubmit, invalid, submitting }) => (
            <form onSubmit={handleSubmit} id="setnewpassword_form">
              {this.props.errorList
                ? this.props.errorList.map((errorMessage, i) => (
                    <div className="alert alert-danger" role="alert" key={'error' + i}>
                      {errorMessage && errorMessage.code ? t('common:error.' + errorMessage.code) : ''}
                    </div>
                  ))
                : ''}
              <h1 className="text-center">{t('set-new-password:set-new-password-header')}</h1>
              <hr />
              <div className="form-group">
                <label htmlFor="reg_email" className="sr-only">
                  {t('set-new-password:email')}
                </label>
                {this.props.userEmail}
              </div>
              <Field
                name="password"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'set-new-password:password'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_LENGTH_BETWEEN', 'set-new-password:password', {
                      min: PASSWORD_MIN,
                      max: PASSWORD_MAX,
                    }),
                    isLengthBetween(PASSWORD_MIN, PASSWORD_MAX),
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group">
                    <label htmlFor="reg_pass1" className="sr-only">
                      {t('set-new-password:password')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Minimum length: 8 characters."
                      type="password"
                      className="form-control"
                      placeholder={t('set-new-password:password')}
                      required
                    />
                    <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                  </div>
                )}
              </Field>
              <Field
                name="confirmPassword"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'set-new-password:confirm-new-password'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_LENGTH_BETWEEN', 'set-new-password:confirm-new-password', {
                      min: PASSWORD_MIN,
                      max: PASSWORD_MAX,
                    }),
                    isLengthBetween(PASSWORD_MIN, PASSWORD_MAX),
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group">
                    <label htmlFor="reg_pass2" className="sr-only">
                      {t('set-new-password:confirm-new-password')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Type your password again."
                      type="password"
                      className="form-control"
                      placeholder={t('set-new-password:confirm-new-password')}
                      required
                    />
                    <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                  </div>
                )}
              </Field>

              <button
                className="btn btn-lg btn-success btn-block"
                type="submit"
                id="setnewpassword_button"
                disabled={invalid || submitting || this.props.loading}
              >
                <span className="fas fa-pencil-alt fa-fw " />
                {t('set-new-password:submit')}
              </button>
            </form>
          )}
        />
      </div>
    );
  }
}

SetNewPasswordFromResetForm.propTypes = {
  t: PropTypes.func.isRequired,
  setPasswordFromReset: PropTypes.func,
  errorList: PropTypes.array,
  userEmail: PropTypes.string,
  resetToken: PropTypes.string,
  loading: PropTypes.bool,
};

export default SetNewPasswordFromResetForm;
