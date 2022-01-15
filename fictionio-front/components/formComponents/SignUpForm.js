import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'react-final-form';
import { compose } from 'recompose';
import { composeValidators, getErrorMessage, isEmail, isLengthBetween, required } from '../../common/Validator';
import { EMAIL_MIN, EMAIL_MAX, DISPLAY_NAME_MIN, DISPLAY_NAME_MAX, PASSWORD_MAX, PASSWORD_MIN } from '../../config/fieldLength';
import { withGoogleReCaptcha } from 'react-google-recaptcha-v3';

class Signup extends React.Component {

  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'signup'],
    };
  }

  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.submitRegisterUser = this.submitRegisterUser.bind(this);
  }

  async submitRegisterUser(values) {
    const token = await this.props.googleReCaptchaProps.executeRecaptcha('signup');
    this.props.signup(values.email, values.password, values.displayName, new Date(values.dateOfBirth), token);
  }

  validate(values) {
    const errors = {};
    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = this.props.t('signup:password-mismatch');
    }
    if (values.email !== values.confirmEmail) {
      errors.confirmEmail = this.props.t('signup:email-mismatch');
    }
    return errors;
  }

  render() {
    const { t } = this.props;
    return (
      <div className="mx-auto form-narrow" id="signup_container">
        <Form
          onSubmit={this.submitRegisterUser}
          validate={this.validate}
          render={({ handleSubmit, invalid, submitting }) => (
            <form onSubmit={handleSubmit} id="signup_form">
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
              <h1 className="text-center">{t('signup:user-signup')}</h1>
              <hr />
              <Field
                name="displayName"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'signup:display-name'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_LENGTH_BETWEEN', 'signup:display-name', {
                      min: DISPLAY_NAME_MIN,
                      max: DISPLAY_NAME_MAX,
                    }),
                    isLengthBetween(DISPLAY_NAME_MIN, DISPLAY_NAME_MAX),
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group">
                    <label htmlFor="reg_username" className="sr-only">
                      {t('signup:display-name')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Alphanumeric characters only."
                      type="text"
                      className="form-control"
                      placeholder={t('signup:display-name')}
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
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'signup:password'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_LENGTH_BETWEEN', 'signup:password', {
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
                      {t('signup:password')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Minimum length: 8 characters."
                      type="password"
                      className="form-control"
                      placeholder={t('signup:password')}
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
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'signup:re-password'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_LENGTH_BETWEEN', 'signup:re-password', {
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
                      {t('signup:re-password')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Type your password again."
                      type="password"
                      className="form-control"
                      placeholder={t('signup:re-password')}
                      required
                    />
                    <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                  </div>
                )}
              </Field>
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
                    <label htmlFor="reg_email1" className="sr-only">
                      {t('signup:e-mail')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Valid email required for activation."
                      type="email"
                      className="form-control"
                      placeholder={t('signup:e-mail')}
                      required
                    />
                    <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                  </div>
                )}
              </Field>
              <Field
                name="confirmEmail"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'signup:re-e-mail'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_INCORRECT_FORMAT', 'signup:re-e-mail'),
                    isEmail,
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group">
                    <label htmlFor="reg_email2" className="sr-only">
                      {t('signup:re-e-mail')}
                    </label>
                    <input
                      {...input}
                      data-toggle="popover"
                      data-content="Type your email again."
                      type="email"
                      className="form-control"
                      placeholder={t('signup:re-e-mail')}
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
                <span className="fas fa-pencil-alt fa-fw " /> {t('signup:submit')}
              </button>
            </form>
          )}
        />
      </div>
    );
  }
}

Signup.propTypes = {
  t: PropTypes.func.isRequired,
  signup: PropTypes.func,
  currentUser: PropTypes.object,
  errorList: PropTypes.array,
  googleReCaptchaProps: PropTypes.object,
  loading: PropTypes.bool,
};

export default withGoogleReCaptcha(Signup);
