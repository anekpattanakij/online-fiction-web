import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'react-final-form';
import { compose } from 'recompose';
import {
  composeValidators,
  getErrorMessage,
  isLengthBetween,
  required,
  matchLanguage,
  matchLanguageOrEnglish,
} from '../../common/Validator';
import { FICTION_NAME_MIN, FICTION_NAME_MAX } from '../../config/fieldLength';
import ReactSelect from 'react-select';
import { FieldArray } from 'react-final-form-arrays';
import arrayMutators from 'final-form-arrays';
import Fiction from '../../common/Fiction';
import { PricingModelList } from '../../common/PricingModel';
import CoinIcon from '../CoinIcon';
import ReactSVG from 'react-svg';
import { generateStaticPath } from '../../util/staticPathUtil';
import { Link } from '../../i18n';

class EditFictionForm extends React.Component {
  state = {
    genresSelected: true,
    loadedFile: null,
  };

  generatePricingModelOptionList = () => {
    const resultOptionList = [];
    PricingModelList.map(pricingCode => {
      resultOptionList.push({ value: pricingCode, label: this.props.t('pricing-model:' + pricingCode) });
    });
    return resultOptionList;
  };

  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.saveUpdateFiction = this.saveUpdateFiction.bind(this);
    this.generatePricingModelOptionList = this.generatePricingModelOptionList.bind(this);
    this.CheckboxGroup = this.CheckboxGroup.bind(this);
    this.readFile = this.readFile.bind(this);
    this.initializeForm = this.initializeForm.bind(this);
  }

  saveUpdateFiction(values) {
    const inputNewFiction = new Fiction();
    inputNewFiction.fictionId = this.props.currentFiction.fictionId;
    inputNewFiction.categories = values.genres;
    inputNewFiction.fictionName = values.fictionName;
    inputNewFiction.shortDetail = values.shortStory;
    inputNewFiction.pricingModel = values.pricingModel.value;
    inputNewFiction.coin = values.coin;
    inputNewFiction.ageRestriction = values.ageRestriction ? true : false;
    if (this.state.loadedFile !== null) {
      inputNewFiction.cover = this.state.loadedFile;
    }
    this.props.saveUpdateFiction(this.props.sessionTimeout, this.props.updateAccessToken, this.props.currentUser, inputNewFiction);
  }

  validate(values) {
    const errors = {};
    if (values) {
      if (values.originalLanguage && !matchLanguageOrEnglish(values.originalLanguage.value.toUpperCase())(values.fictionName)) {
        errors.fictionName = this.props.t('common:error.ERR_FIELD_MISMATCH_LANGUAGE_OR_ENGLISH', {
          field: this.props.t('fiction-new:fiction-name'),
          language: this.props.t('language-list:' + values.originalLanguage.value + '-full'),
        });
      }

      if (values.originalLanguage && !matchLanguage(values.originalLanguage.value.toUpperCase())(values.shortStory)) {
        errors.shortStory = this.props.t('common:error.ERR_FIELD_MISMATCH_LANGUAGE', {
          field: this.props.t('fiction-new:short-story'),
          language: this.props.t('language-list:' + values.originalLanguage.value + '-full'),
        });
      }
    }
    if (this.state.genresSelected !== (values.genres && values.genres.length > 0)) {
      this.setState({ genresSelected: values.genres && values.genres.length > 0 });
    }

    return errors;
  }

  readFile = acceptFile => {
    const files = acceptFile.target.files;
    if (files && files.length > 0) {
      acceptFile.target = files[0];
      // Code to execute for every file selected
      const reader = new FileReader();
      reader.readAsDataURL(files[0]);
      reader.onload = event => {
        this.setState({ loadedFile: event.target.result });
      };
    }
  };

  CheckboxGroup = ({ fields, options }) => {
    const toggle = (event, option) => {
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
          <div className="col-6 col-md-4 col-lg-3 col-xl-2" key={option.category}>
            <div className="custom-control custom-checkbox form-check py-0">
              <input
                type="checkbox"
                className="custom-control-input "
                id={'genres-' + option.category}
                onChange={event => toggle(event, option.category)}
                checked={fields && fields.value && fields.value.indexOf(option.category) >= 0}
              />
              <label className="custom-control-label" htmlFor={'genres-' + option.category}>
                <span className="badge badge-secondary">{this.props.t('genres:' + option.category)}</span>
              </label>
            </div>
          </div>
        ))}
      </React.Fragment>
    );
  };

  initializeForm = (fiction, user) => {
    // const nullOrValue = value => (value === null ? '' : value);
    return {
      fictionName: fiction ? Fiction.getFictionName(fiction, fiction.originalFictionLanguage) : '',
      shortStory: fiction ? Fiction.getFictionShortStory(fiction, fiction.originalFictionLanguage) : '',
      genres: fiction ? fiction.categories : '',
      ageRestriction: fiction ? fiction.ageRestriction : false,
      pricingModel:
        fiction && fiction.pricingModel && user
          ? {
              value: fiction.pricingModel[user.cif][fiction.originalFictionLanguage.toUpperCase()].model,
              label: this.props.t('pricing-model:' + fiction.pricingModel[user.cif][fiction.originalFictionLanguage.toUpperCase()].model),
            }
          : '',
      coin:
        fiction && fiction.pricingModel && user ? fiction.pricingModel[user.cif][fiction.originalFictionLanguage.toUpperCase()].coin : '',
    };
  };

  render() {
    const { t, currentFiction, currentUser } = this.props;
    return (
      <div className="card-body">
        <Form
          initialValues={this.initializeForm(currentFiction, currentUser)}
          onSubmit={this.saveUpdateFiction}
          validate={this.validate}
          mutators={{
            ...arrayMutators,
            numberOnly: (args, state, utils) => {
              if (/^\+?(0|[1-9]\d*)$/.test(args[0])) {
                utils.changeValue(state, args[1], () => args[0]);
              }
            },
          }}
          render={({
            handleSubmit,
            form: {
              mutators: { numberOnly },
            },
            invalid,
            submitting,
          }) => (
            <form id="edit_fiction_form" onSubmit={handleSubmit}>
              {this.props.fictionErrorList && this.props.fictionErrorList.length > 0 ? (
                <div className="alert alert-danger" role="alert">
                  <ul>
                    {this.props.fictionErrorList.map((errorItem, errorKey) => (
                      <li key={errorKey}>{t('common:error.' + errorItem.code)}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                ''
              )}
              <Field
                name="fictionName"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'fiction-new:fiction-name'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_LENGTH_BETWEEN', 'fiction-new:fiction-name', {
                      min: FICTION_NAME_MIN,
                      max: FICTION_NAME_MAX,
                    }),
                    isLengthBetween(FICTION_NAME_MIN, FICTION_NAME_MAX),
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group row">
                    <label htmlFor="fiction_name" className="col-md-3 col-form-label">
                      {t('fiction-new:fiction-name')}
                    </label>
                    <div className="col-md-9">
                      <input
                        {...input}
                        type="text"
                        className="form-control"
                        id="fiction_name"
                        name="fiction_name"
                        placeholder={t('fiction-new:fiction-name-place-holder')}
                      />
                      <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                    </div>
                  </div>
                )}
              </Field>

              <div className="form-group row">
                <label htmlFor="fiction_lang_id" className="col-md-3 col-form-label">
                  {t('fiction-new:original-language')}
                </label>
                <div className="col-md-9">
                  {currentFiction && currentFiction.originalFictionLanguage ? (
                    <React.Fragment>
                      <ReactSVG
                        className="flag-icon"
                        src={generateStaticPath('/img/flag/' + currentFiction.originalFictionLanguage.toLowerCase() + '.svg')}
                      />
                      &nbsp;{t('language-list:' + currentFiction.originalFictionLanguage.toLowerCase() + '-full')}
                    </React.Fragment>
                  ) : (
                    ''
                  )}
                </div>
              </div>

              <div className="form-group row">
                <label htmlFor="fiction_genres" className="col-md-3 col-form-label">
                  {t('fiction-new:genres')}
                </label>
                <div className="col-md-9">
                  <div className="row mb-2">
                    {!this.state.genresSelected ? (
                      <span className="col-12 strong border-bottom mb-1 errorMessageShow">
                        {this.props.t('common:error.ERR_FIELD_SELECT_AT_LEAST_ONE', { field: this.props.t('fiction-new:genres') })}
                      </span>
                    ) : (
                      ''
                    )}
                    <FieldArray name="genres" component={this.CheckboxGroup} options={this.props.genresList ? this.props.genresList : []} />
                  </div>
                </div>
              </div>

              <Field name="ageRestriction" component="input" type="checkbox">
                {({ input }) => (
                  <div className="form-group row">
                    <label htmlFor="fiction_restriction" className="col-md-3 col-form-label">
                      <span className="label label-danger"> {t('fiction-new:age-restriction')}</span>
                    </label>
                    <div className="col-md-9">
                      <div className="custom-control custom-checkbox form-check">
                        <input
                          {...input}
                          type="checkbox"
                          className="custom-control-input"
                          id="fiction_restriction"
                          name="fiction_restriction"
                          value="1"
                          data-state="0"
                        />
                        <label className="custom-control-label" htmlFor="fiction_restriction">
                          &nbsp;
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </Field>

              <Field
                name="pricingModel"
                component="select"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'fiction-new:price-model'),
                    required,
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group row">
                    <label htmlFor="fiction_price_select" className="col-md-3 col-form-label">
                      {t('fiction-new:price-model')}
                    </label>
                    <div className="col-md-9">
                      <ReactSelect
                        {...input}
                        id="fiction_price_select"
                        name="fiction_price_select"
                        options={this.generatePricingModelOptionList()}
                        label="fiction_price_select"
                        placeholder={t('fiction-new:price-model-place-holder')}
                      />
                      <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                    </div>
                  </div>
                )}
              </Field>

              <Field
                name="coin"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'fiction-new:price'),
                    required,
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group row">
                    <label htmlFor="fiction_price" className="col-md-3 col-form-label">
                      {t('fiction-new:price')}
                    </label>
                    <div className="col-md-9">
                      <div className="container  pl-0">
                        <div className="row">
                          <div className="col-4 col-md-3 ">
                            <input
                              {...input}
                              type="text"
                              className="form-control"
                              id="fiction_price"
                              name="fiction_price"
                              placeholder={t('fiction-new:price-place-holder')}
                              onChange={e => numberOnly(e.target.value, 'coin')}
                            />
                          </div>
                          <div className="col-3 col-md-3  ml-3">
                            <CoinIcon />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-12">
                            <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Field>
              <Field
                name="shortStory"
                component="textarea"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'fiction-new:short-story'),
                    required,
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group row">
                    <label htmlFor="fiction_description" className="col-md-3 col-form-label">
                      {t('fiction-new:short-story')}
                    </label>
                    <div className="col-md-9">
                      <textarea
                        {...input}
                        className="form-control"
                        id="fiction_description"
                        name="fiction_description"
                        placeholder={t('fiction-new:short-story-place-holder')}
                      />
                      <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                    </div>
                  </div>
                )}
              </Field>

              <div className="form-group row">
                <label htmlFor="file" className="col-md-3 col-form-label">
                  {t('fiction-new:cover-image')}
                </label>
                <div className="col-md-9">
                  <div className="input-group">
                    <div className="container">
                      <div className="col-12">{t('fiction-new:cover-size')}</div>
                      <div className="col-12">
                        <span className="input-group-append">
                          <span className="btn btn-secondary btn-file">
                            <span className="far fa-folder-open fa-fw " /> <span className="span-1280">Browse</span>{' '}
                            <input
                              required=""
                              type="file"
                              name="file"
                              id="file"
                              multiple={false}
                              accept=".jpg,.jpeg,.png,.gif"
                              onChange={e => this.readFile(e)}
                            />
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center ">
                <div className="col-auto order-1" style={{ display: 'inline' }}>
                  <Link
                    href={'/fiction?fiction=' + (currentFiction ? currentFiction.fictionId : '')}
                    as={'/fiction/' + (currentFiction ? currentFiction.fictionId : '')}
                  >
                    <a role="button" title="Back to fiction" className="btn btn-secondary">
                      <span className="fas fa-undo fa-fw "></span>
                      {t('fiction-new:back')}
                    </a>
                  </Link>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  id="fiction_save_edit_button"
                  disabled={invalid || submitting || this.props.fictionLoading}
                  style={{ display: 'inline' }}
                >
                  <span className="fas fa-plus-circle fa-fw " /> {t('fiction-new:submit-edit-fiction')}
                </button>
              </div>
            </form>
          )}
        />
      </div>
    );
  }
}

EditFictionForm.propTypes = {
  t: PropTypes.func.isRequired,
  saveUpdateFiction: PropTypes.func,
  currentUser: PropTypes.object,
  currentFiction: PropTypes.object,
  fictionErrorList: PropTypes.array,
  genresList: PropTypes.array,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  fictionLoading: PropTypes.bool,
};

export default EditFictionForm;
