import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'react-final-form';
import { compose } from 'recompose';
import { composeValidators, getErrorMessage, required, isEmail } from '../../common/Validator';
import Config from '../../config/index';
import { FieldArray } from 'react-final-form-arrays';
import arrayMutators from 'final-form-arrays';

class UpdateProfileForm extends React.Component {
  state = {
    loadedFile: null,
  };

  CheckboxGroup = ({ fields, options }) => {
    const toggle = (event, option) => {
      if (!fields.value) {
        fields.value = [];
      }
      if (event.target.checked) {
        if (fields.value.indexOf(option) < 0) {
          fields.push(option);
        }
      } else {
        fields.remove(fields.value.indexOf(option));
      }
    };

    return (
      <React.Fragment>
        {options.map(option => (
          <div className="col-6 col-md-4 col-lg-3 col-xl-2" key={option}>
            <div className="custom-control custom-checkbox form-check py-0">
              <input
                type="checkbox"
                className="custom-control-input indeterminate-mark "
                id={'filter-langauges-' + option}
                onChange={event => toggle(event, option)}
                checked={fields.value.indexOf(option) >= 0}
              />
              <label className="custom-control-label" htmlFor={'filter-langauges-' + option}>
                <span className="badge badge-warning">{this.props.t('language-list:' + option + '-full')}</span>
              </label>
            </div>
          </div>
        ))}
      </React.Fragment>
    );
  };

  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.submitUserUpdateProfile = this.submitUserUpdateProfile.bind(this);
  }

  submitUserUpdateProfile(values) {
    const inputObject = Object.assign(this.props.user, {
      email: values.email,
      preferredLanguage: values.filterLanguages,
    });
    this.props.updateProfile(this.props.sessionTimeout, this.props.updateAccessToken, inputObject);
  }

  validate() {
    const errors = {};
    return errors;
  }

  initializeForm = user => {
    // const nullOrValue = value => (value === null ? '' : value);
    return {
      email: user ? user.email : '',
      filterLanguages: user && user.preferredLanguage ? user.preferredLanguage : [],
    };
  };

  render() {
    const { t, user } = this.props;
    return (
      <div className="mx-auto" id="update_profile_container">
        <Form
          initialValues={this.initializeForm(user)}
          onSubmit={this.submitUserUpdateProfile}
          validate={this.validate}
          mutators={{
            ...arrayMutators,
          }}
          render={({ handleSubmit, invalid, submitting }) => (
            <form onSubmit={handleSubmit} id="update_profile_form">
              {this.props.errorList
                ? this.props.errorList.map((errorMessage, i) => (
                    <div className="alert alert-danger" role="alert" key={'error' + i}>
                      {errorMessage && errorMessage.code ? t('common:error.' + errorMessage.code) : ''}
                    </div>
                  ))
                : ''}
              {this.props.result ? (
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
              <div className="form-group row">
                <label htmlFor="display-name-profile" className="col-md-4 col-lg-3 col-xl-2 col-form-label">
                  {t('update-profile:display-name')} :
                </label>
                <div className="col-md-8 col-lg-9 col-xl-10  col-form-label">{this.props.user && this.props.user.displayName}</div>
              </div>

              <Field
                name="email"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'update-profile:e-mail'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_INCORRECT_FORMAT', 'update-profile:e-mail'),
                    isEmail,
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group row">
                    <label htmlFor="e-mail" className="col-md-4 col-lg-3 col-xl-2 col-form-label">
                      {t('update-profile:e-mail')}:
                    </label>
                    <div className="col-md-8 col-lg-9 col-xl-10">
                      <input
                        {...input}
                        data-toggle="popover"
                        data-content="E-mail format."
                        type="test"
                        className="form-control"
                        placeholder={t('update-profile:e-mail')}
                        required
                      />
                      <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                    </div>
                  </div>
                )}
              </Field>

              <div className="form-group row">
                <label htmlFor="filter-language" className="col-md-4 col-lg-3 col-xl-2 col-form-label">
                  {t('update-profile:filter-language')} :
                </label>
                <div className="col-md-8 col-lg-9 col-xl-10">
                  <div className="container">
                    <div className="row">
                      <span className="col-12 strong border-bottom mb-1">{t('update-profile:language')}</span>

                      <FieldArray
                        name="filterLanguages"
                        component={this.CheckboxGroup}
                        options={Config.i18n.whitelist ? Config.i18n.whitelist : []}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="btn btn-danger"
                  id="update_profile_button"
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

UpdateProfileForm.propTypes = {
  t: PropTypes.func.isRequired,
  updateProfile: PropTypes.func,
  user: PropTypes.object,
  errorList: PropTypes.array,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  result: PropTypes.bool,
  loading: PropTypes.bool,
};

export default UpdateProfileForm;
