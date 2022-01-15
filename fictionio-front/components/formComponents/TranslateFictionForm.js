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
import Config from '../../config/index';
import Fiction from '../../common/Fiction';
import { PricingModelList } from '../../common/PricingModel';
import CoinIcon from '../CoinIcon';
import ReactSVG from 'react-svg';
import { generateStaticPath } from '../../util/staticPathUtil';

class TranslateFictionForm extends React.Component {
  state = {
    firstLoad: true,
  };

  generateLanguageOptionList = () => {
    const resultOptionList = [];
    Config.i18n.whitelist.map(countryCode => {
      if (
        this.props.currentFiction &&
        this.props.currentFiction.originalFictionLanguage &&
        countryCode.toUpperCase() !== this.props.currentFiction.originalFictionLanguage.toUpperCase()
      ) {
        resultOptionList.push({ value: countryCode, label: this.props.t('language-list:' + countryCode + '-full') });
      }
    });
    return resultOptionList;
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
    this.generateLanguageOptionList = this.generateLanguageOptionList.bind(this);
    this.generatePricingModelOptionList = this.generatePricingModelOptionList.bind(this);
    this.initializeForm = this.initializeForm.bind(this);
  }

  saveUpdateFiction(values) {
    const inputNewFiction = new Fiction();
    inputNewFiction.fictionId = this.props.currentFiction.fictionId;
    inputNewFiction.fictionName = values.fictionName;
    inputNewFiction.shortDetail = values.shortStory;
    inputNewFiction.language = values.translateToLanguage.value;
    inputNewFiction.pricingModel = values.pricingModel.value;
    inputNewFiction.coin = values.coin ? values.coin : 0;
    this.props.saveTranslateFiction(this.props.sessionTimeout, this.props.updateAccessToken, this.props.currentUser, inputNewFiction);
  }

  validate(values) {
    const errors = {};
    if (values) {
      if (values.translateToLanguage && !matchLanguageOrEnglish(values.translateToLanguage.value.toUpperCase())(values.fictionName)) {
        errors.fictionName = this.props.t('common:error.ERR_FIELD_MISMATCH_LANGUAGE_OR_ENGLISH', {
          field: this.props.t('translate-fiction:translate-fiction-name'),
          language: this.props.t('language-list:' + values.translateToLanguage.value + '-full'),
        });
      }

      if (values.translateToLanguage && !matchLanguage(values.translateToLanguage.value.toUpperCase())(values.shortStory)) {
        errors.shortStory = this.props.t('common:error.ERR_FIELD_MISMATCH_LANGUAGE', {
          field: this.props.t('translate-fiction:translate-short-story'),
          language: this.props.t('language-list:' + values.translateToLanguage.value + '-full'),
        });
      }
    }
    if (values.pricingModel && values.pricingModel.value.toUpperCase() !== 'FA' && (!values.coin || parseInt(values.coin) === 0)) {
      errors.coin = this.props.t('common:error.ERR_FIELD_REQUIRED', {
        field: this.props.t('fiction-new:price'),
      });
    }

    return errors;
  }

  initializeForm = () => {
    if (this.state.firstLoad) {
      return {
        fictionName: '',
        shortStory: '',
        pricingModel: {},
        coin: 0,
      };
    } else {
      this.setState({ firstLoad: false });
    }
  };

  render() {
    const { t, currentFiction, lng } = this.props;
    return (
      <div className="card-body">
        <Form
          onSubmit={this.saveUpdateFiction}
          validate={this.validate}
          mutators={{
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
            <form id="fiction_add_form" onSubmit={handleSubmit}>
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

              <div className="form-group row">
                <label htmlFor="fiction_name" className="col-md-3 col-form-label">
                  {t('translate-fiction:fiction-name')}
                </label>
                <div className="col-md-9">
                  {currentFiction
                    ? Fiction.displayFictionName(currentFiction, ('' + this.props.currentFiction.originalFictionLanguage).toUpperCase())
                    : ''}
                </div>
              </div>
              <Field
                name="fictionName"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'translate-fiction:translate-fiction-name'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_LENGTH_BETWEEN', 'translate-fiction:translate-fiction-name', {
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
                      {t('translate-fiction:translate-fiction-name')}
                    </label>
                    <div className="col-md-9">
                      <input
                        {...input}
                        type="text"
                        className="form-control"
                        id="fiction_name"
                        name="fiction_name"
                        placeholder={t('translate-fiction:translate-fiction-name-place-holder')}
                      />
                      <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                    </div>
                  </div>
                )}
              </Field>

              <div className="form-group row">
                <label htmlFor="fiction_lang" className="col-md-3 col-form-label">
                  {t('translate-fiction:original-language')}
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

              <Field
                name="translateToLanguage"
                component="select"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'translate-fiction:to-language'),
                    required,
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group row">
                    <label htmlFor="fiction_lang_id" className="col-md-3 col-form-label">
                      {t('translate-fiction:to-language')}
                    </label>
                    <div className="col-md-9">
                      <ReactSelect
                        {...input}
                        id="fiction_lang_id"
                        name="fiction_lang_id"
                        options={currentFiction && currentFiction.originalFictionLanguage ? this.generateLanguageOptionList() : []}
                        label="fiction_lang_id"
                        placeholder={t('translate-fiction:to-language-place-holder')}
                      />
                      <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                    </div>
                  </div>
                )}
              </Field>

              <Field
                name="pricingModel"
                component="select"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'translate-fiction:price-model'),
                    required,
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group row">
                    <label htmlFor="fiction_price_select" className="col-md-3 col-form-label">
                      {t('translate-fiction:price-model')}
                    </label>
                    <div className="col-md-9">
                      <ReactSelect
                        {...input}
                        id="fiction_price_select"
                        name="fiction_price_select"
                        options={this.generatePricingModelOptionList()}
                        label="fiction_price_select"
                        placeholder={t('translate-fiction:price-model-place-holder')}
                      />
                      <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                    </div>
                  </div>
                )}
              </Field>

              <Field name="coin">
                {({ input, meta }) => (
                  <div className="form-group row">
                    <label htmlFor="fiction_price" className="col-md-3 col-form-label">
                      {t('translate-fiction:price')}
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
                              placeholder={t('translate-fiction:price-place-holder')}
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
              <div className="form-group row">
                <label htmlFor="fiction_description" className="col-md-3 col-form-label">
                  {t('translate-fiction:short-story')}
                </label>
                <div className="col-md-9">{currentFiction ? Fiction.displayShortDetail(currentFiction, ('' + lng).toUpperCase()) : ''}</div>
              </div>
              <Field
                name="shortStory"
                component="textarea"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'translate-fiction:translate-short-story'),
                    required,
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group row">
                    <label htmlFor="fiction_description" className="col-md-3 col-form-label">
                      {t('translate-fiction:translate-short-story')}
                    </label>
                    <div className="col-md-9">
                      <textarea
                        {...input}
                        className="form-control"
                        id="short_story"
                        name="short_story"
                        placeholder={t('translate-fiction:translate-short-story-place-holder')}
                      />
                      <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                    </div>
                  </div>
                )}
              </Field>

              <div className="text-center">
                <button type="submit" className="btn btn-secondary" id="save_translate_fiction_button" disabled={invalid || submitting}>
                  <span className="fas fa-plus-circle fa-fw " /> {t('translate-fiction:save-translate-fiction')}
                </button>
              </div>
            </form>
          )}
        />
      </div>
    );
  }
}

TranslateFictionForm.propTypes = {
  t: PropTypes.func.isRequired,
  saveTranslateFiction: PropTypes.func,
  currentUser: PropTypes.object,
  currentFiction: PropTypes.object,
  fictionErrorList: PropTypes.array,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  lng: PropTypes.string,
};

export default TranslateFictionForm;
