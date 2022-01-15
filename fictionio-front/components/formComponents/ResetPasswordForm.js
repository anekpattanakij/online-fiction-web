import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'react-final-form';
import { compose } from 'recompose';
import { composeValidators, getErrorMessage, isEmail, required, isLengthBetween } from '../../common/Validator';
import { Link } from '../../i18n';
import { EMAIL_MIN, EMAIL_MAX } from '../../config/fieldLength';

class ResetPasswordForm extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'reset-password'],
    };
  }

  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.submitResetPassword = this.submitResetPassword.bind(this);
  }

  submitResetPassword(values) {
    this.props.resetPassword(values.email, this.props.lng);
  }

  validate() {
    const errors = {};
    return errors;
  }

  render() {
    const { t } = this.props;
    return (
      <div className="mx-auto form-narrow" id="reset_password_container">
        {this.props.result ? (
          <div
            className="alert alert-success alert-dismissible fade show text-center"
            role="alert"
            style={{ marginBottom: '1rem', marginTop: '1rem' }}
          >
            {t('reset-password:success')}
          </div>
        ) : (
          ''
        )}
        <Form
          onSubmit={this.submitResetPassword}
          validate={this.validate}
          render={({ handleSubmit, invalid, submitting }
            ) => (
            <form onSubmit={handleSubmit} id="login_form">
              {this.props.errorList
                ? this.props.errorList.map((errorMessage, i) => (
                    <div className="alert alert-danger" role="alert" key={'error' + i}>
                      {errorMessage && errorMessage.code ? t('common:error.' + errorMessage.code) : ''}
                    </div>
                  ))
                : ''}
              <h1 className="text-center">{t('reset-password:reset-password-header')}</h1>
              <hr />
              <Field
                name="email"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'signup:email'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_INCORRECT_FORMAT', 'signup:email'),
                    isEmail,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_LENGTH_BETWEEN', 'login:email', {
                      min: EMAIL_MIN,
                      max: EMAIL_MAX,
                    }),
                    isLengthBetween(EMAIL_MIN, EMAIL_MAX),
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group">
                    <label htmlFor="reg_email" className="sr-only">
                      {t('reset-password:email')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Alphanumeric characters only."
                      type="text"
                      className="form-control"
                      placeholder="E-mail"
                      required
                    />
                    <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                  </div>
                )}
              </Field>

              <button
                className="btn btn-lg btn-success btn-block"
                type="submit"
                id="reset_password_button"
                disabled={invalid || submitting || this.props.loading}
              >
                <span className="fas fa-sign-in-alt fa-fw  " /> {t('reset-password:reset-password')}
              </button>
              <Link href="/signup">
                <a className="btn btn-lg btn-warning btn-block" id="login_button" disabled={submitting  || this.props.loading}>
                  <span className="fas fa-sync fa-fw " /> {t('reset-password:login')}
                </a>
              </Link>
              <Link href="/signup">
                <a className="btn btn-lg btn-info btn-block" id="signup_button" disabled={submitting  || this.props.loading}>
                  <span className="fas fa-pencil-alt fa-fw " /> {t('reset-password:signup')}
                </a>
              </Link>
            </form>
          )}
        />
      </div>
    );
  }
}

ResetPasswordForm.propTypes = {
  t: PropTypes.func.isRequired,
  resetPassword: PropTypes.func,
  errorList: PropTypes.array,
  lng: PropTypes.string,
  result: PropTypes.bool,
  loading: PropTypes.bool,
};

export default ResetPasswordForm;
