import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'react-final-form';
import { compose } from 'recompose';
import { composeValidators, getErrorMessage, required, isLengthBetween } from '../../common/Validator';
import { PASSWORD_MAX, PASSWORD_MIN } from '../../config/fieldLength';

class ChangePasswordForm extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'update-profile'],
    };
  }

  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.submitChangePassword = this.submitChangePassword.bind(this);
  }

  submitChangePassword(values) {
    this.props.changePassword(
      this.props.sessionTimeout,
      this.props.updateAccessToken,
      this.props.currentUser,
      values.oldpassword,
      values.newpassword1,
    );
  }

  validate(values) {
    const errors = {};
    if (values.newpassword1 !== values.newpassword2) {
      errors.newpassword2 = this.props.t('update-profile:password-mismatch');
    }
    return errors;
  }

  render() {
    const { t } = this.props;
    return (
      <div className="mx-auto" id="changepassword_container">
        <Form
          onSubmit={this.submitChangePassword}
          validate={this.validate}
          render={({ handleSubmit, invalid, submitting }) => (
            <form onSubmit={handleSubmit} id="changepassword_form">
              {this.props.changePasswordErrorList
                ? this.props.changePasswordErrorList.map((errorMessage, i) => (
                    <div className="alert alert-danger" role="alert" key={'error' + i}>
                      {errorMessage && errorMessage.code ? t('common:error.' + errorMessage.code) : ''}
                    </div>
                  ))
                : ''}
              {this.props.changePasswordResult ? (
                <div
                  className="alert alert-success alert-dismissible fade show text-center"
                  role="alert"
                  style={{ marginBottom: '1rem', marginTop: '1rem' }}
                >
                  {t('update-profile:success')}
                </div>
              ) : (
                ''
              )}
              <Field
                name="oldpassword"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'update-profile:old-password'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_LENGTH_BETWEEN', 'update-profile:old-password', {
                      min: PASSWORD_MIN,
                      max: PASSWORD_MAX,
                    }),
                    isLengthBetween(PASSWORD_MIN, PASSWORD_MAX),
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group row">
                    <label htmlFor="old_password" className="col-md-4 col-lg-3 col-xl-2 col-form-label">
                      {t('update-profile:old-password')}:
                    </label>
                    <div className="col-md-8 col-lg-9 col-xl-10">
                      <input
                        {...input}
                        type="password"
                        className="form-control"
                        id="old_password"
                        name="old_password"
                        placeholder={t('update-profile:old-password')}
                        required=""
                      />
                      <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                    </div>
                  </div>
                )}
              </Field>
              <Field
                name="newpassword1"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'update-profile:new-password'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_LENGTH_BETWEEN', 'update-profile:new-password', {
                      min: PASSWORD_MIN,
                      max: PASSWORD_MAX,
                    }),
                    isLengthBetween(PASSWORD_MIN, PASSWORD_MAX),
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group row">
                    <label htmlFor="new_password" className="col-md-4 col-lg-3 col-xl-2 col-form-label">
                      {t('update-profile:new-password')}:
                    </label>
                    <div className="col-md-8 col-lg-9 col-xl-10">
                      <input
                        {...input}
                        type="password"
                        className="form-control"
                        id="new_password"
                        name="new_password1"
                        placeholder={t('update-profile:new-password')}
                        required=""
                      />
                      <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                    </div>
                  </div>
                )}
              </Field>
              <Field
                name="newpassword2"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'update-profile:confirm-new-password'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_LENGTH_BETWEEN', 'update-profile:confirm-new-password', {
                      min: PASSWORD_MIN,
                      max: PASSWORD_MAX,
                    }),
                    isLengthBetween(PASSWORD_MIN, PASSWORD_MAX),
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group row">
                    <label htmlFor="new_password2" className="col-md-4 col-lg-3 col-xl-2 col-form-label">
                      {t('update-profile:confirm-new-password')} :
                    </label>
                    <div className="col-md-8 col-lg-9 col-xl-10">
                      <input
                        {...input}
                        type="password"
                        className="form-control"
                        id="new_password2"
                        name="new_password2"
                        placeholder={t('update-profile:confirm-new-password')}
                        required=""
                      />
                      <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                    </div>
                  </div>
                )}
              </Field>
              <div className="text-center">
                <button
                  type="submit"
                  className="btn btn-danger"
                  id="change_password_button"
                  disabled={invalid || submitting || this.props.loading}
                >
                  <span className="fas fa-save fa-fw " /> {t('update-profile:save')}
                </button>
              </div>
            </form>
          )}
        />
      </div>
    );
  }
}

ChangePasswordForm.propTypes = {
  t: PropTypes.func.isRequired,
  login: PropTypes.func,
  user: PropTypes.object,
  changePasswordErrorList: PropTypes.array,
  changePassword: PropTypes.func,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  currentUser: PropTypes.object,
  loading: PropTypes.bool,
  changePasswordResult: PropTypes.bool,
};

export default ChangePasswordForm;
