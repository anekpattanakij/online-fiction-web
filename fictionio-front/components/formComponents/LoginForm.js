import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'react-final-form';
import { compose } from 'recompose';
import { composeValidators, getErrorMessage, isLengthBetween, required } from '../../common/Validator';
import { EMAIL_MIN, EMAIL_MAX, PASSWORD_MAX, PASSWORD_MIN } from '../../config/fieldLength';
import { Link } from '../../i18n';
import { withGoogleReCaptcha } from 'react-google-recaptcha-v3'

class LoginForm extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'login'],
    };
  }

  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.submitUserLogin = this.submitUserLogin.bind(this);
  }

  async submitUserLogin(values) {
    this.props.resetSessionTimeout();
    const token = await this.props.googleReCaptchaProps.executeRecaptcha('login');
    this.props.login(values.email, values.password, token);
  }

  validate() {
    const errors = {};
    return errors;
  }

  render() {
    const { t, isSessionTimeout } = this.props;
    return (
      <div className="mx-auto form-narrow" id="login_container">
        {isSessionTimeout ? (
          <div className="alert alert-danger" role="alert">
            {t('common:error:ERROR_CODE_SESSION_TIMEOUT')}
          </div>
        ) : (
          ''
        )}

        <Form
          onSubmit={this.submitUserLogin}
          validate={this.validate}
          render={({ handleSubmit, invalid, submitting }) => (
            <form onSubmit={handleSubmit} id="login_form">
              {this.props.errorList
                ? this.props.errorList.map((errorMessage, i) =>
                    errorMessage && errorMessage.code ? (
                      <div className="alert alert-danger" role="alert" key={'error' + i}>
                        {t('common:error.' + errorMessage.code)}
                      </div>
                    ) : (
                      ''
                    ),
                  )
                : ''}
              <h1 className="text-center">{t('login:user-login')}</h1>
              <hr />
              <Field
                name="email"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'login:email'),
                    required,
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
                    <label htmlFor="reg_username" className="sr-only">
                      {t('login:email')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="E-mail Only."
                      type="text"
                      className="form-control"
                      placeholder={t('login:email')}
                      required
                    />
                    <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                  </div>
                )}
              </Field>

              <Field
                name="password"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'login:password'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_LENGTH_BETWEEN', 'login:password', {
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
                      {t('login:password')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Minimum length: 8 characters."
                      type="password"
                      className="form-control"
                      placeholder={t('login:password')}
                      required
                    />
                    <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                  </div>
                )}
              </Field>
              <button
                className="btn btn-lg btn-success btn-block"
                type="submit"
                id="signup_button"
                disabled={invalid || submitting || this.props.loading}
              >
                <span className="fas fa-sign-in-alt fa-fw  " /> {t('login:login')}
              </button>
              <Link href="/reset-password">
                <a
                  className="btn btn-lg btn-warning btn-block"
                  type="submit"
                  id="signup_button"
                  disabled={invalid || submitting || this.props.loading}
                >
                  <span className="fas fa-sync fa-fw " /> {t('login:reset-password')}
                </a>
              </Link>
              <Link href="/signup">
                <a
                  className="btn btn-lg btn-info btn-block"
                  type="submit"
                  id="signup_button"
                  disabled={invalid || submitting || this.props.loading}
                >
                  <span className="fas fa-pencil-alt fa-fw " /> {t('login:signup')}
                </a>
              </Link>
            </form>
          )}
        />
      </div>
    );
  }
}

LoginForm.propTypes = {
  t: PropTypes.func.isRequired,
  login: PropTypes.func,
  resetSessionTimeout: PropTypes.func,
  user: PropTypes.object,
  errorList: PropTypes.array,
  isSessionTimeout: PropTypes.bool,
  googleReCaptchaProps: PropTypes.object,
  loading: PropTypes.bool,
};

export default withGoogleReCaptcha(LoginForm);
