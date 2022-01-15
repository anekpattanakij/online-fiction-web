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
import { CHAPTER_NAME_MIN, CHAPTER_NAME_MAX } from '../../config/fieldLength';
import ReactSelect from 'react-select';
import Config from '../../config/index';
import Chapter from '../../common/Chapter';
import ReactSVG from 'react-svg';
import { generateStaticPath } from '../../util/staticPathUtil';
import SimpleEditor from './FormComponent';

class TranslateChapterForm extends React.Component {
  state = {
    firstLoad: true,
  };

  generateLanguageOptionList = () => {
    const resultOptionList = [];
    const filterOutLanguage =
      this.props.originalFiction && this.props.originalFiction.originalFictionLanguage
        ? this.props.originalFiction.originalFictionLanguage
        : this.props.currentChapter.language;
    Config.i18n.whitelist.map(countryCode => {
      if (countryCode.toUpperCase() !== filterOutLanguage) {
        resultOptionList.push({ value: countryCode, label: this.props.t('language-list:' + countryCode + '-full') });
      }
    });
    return resultOptionList;
  };

  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.saveTranslateChapter = this.saveTranslateChapter.bind(this);
    this.generateLanguageOptionList = this.generateLanguageOptionList.bind(this);
    this.initializeForm = this.initializeForm.bind(this);
  }

  saveTranslateChapter(values) {
    const inputNewChapter = new Chapter();
    inputNewChapter.chapterId = this.props.currentChapter.chapterId;
    inputNewChapter.chapterName = values.chapterName;
    inputNewChapter.chapterContent = values.content;
    inputNewChapter.language = values.translateToLanguage.value;
    this.props.saveTranslateChapter(this.props.sessionTimeout, this.props.updateAccessToken, this.props.currentUser, inputNewChapter);
  }

  validate(values) {
    const errors = {};
    if (values) {
      if (values.translateToLanguage && !matchLanguageOrEnglish(values.translateToLanguage.value.toUpperCase())(values.fictionName)) {
        errors.fictionName = this.props.t('common:error.ERR_FIELD_MISMATCH_LANGUAGE_OR_ENGLISH', {
          field: this.props.t('translate-chapter:translate-chapter-name'),
          language: this.props.t('language-list:' + values.translateToLanguage.value + '-full'),
        });
      }

      if (values.translateToLanguage && !matchLanguage(values.translateToLanguage.value.toUpperCase())(values.shortStory)) {
        errors.shortStory = this.props.t('common:error.ERR_FIELD_MISMATCH_LANGUAGE', {
          field: this.props.t('translate-chapter:translate-content'),
          language: this.props.t('language-list:' + values.translateToLanguage.value + '-full'),
        });
      }
    }

    return errors;
  }

  initializeForm = () => {
    if (this.state.firstLoad) {
      return {
        fictionName: '',
        content: '',
        pricingModel: {},
        coin: 0,
      };
    } else {
      this.setState({ firstLoad: false });
    }
  };

  render() {
    const { t, currentChapter } = this.props;
    return (
      <div className="card-body">
        <Form
          initialValues={this.initializeForm(currentChapter)}
          onSubmit={this.saveTranslateChapter}
          validate={this.validate}
          render={({ handleSubmit, invalid, submitting }) => (
            <form id="fiction_new_form" onSubmit={handleSubmit}>
              {this.props.chapterErrorList && this.props.chapterErrorList.length > 0 ? (
                <div className="alert alert-danger" role="alert">
                  <ul>
                    {this.props.chapterErrorList.map((errorItem, errorKey) => (
                      <li key={errorKey}>{t('common:error.' + errorItem.code)}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                ''
              )}

              <div className="form-group row">
                <label htmlFor="chapter_name" className="col-md-3 col-form-label">
                  {t('translate-chapter:chapter-name')}
                </label>
                <div className="col-md-9">{currentChapter && currentChapter.chapterName}</div>
              </div>
              <Field
                name="chapterName"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'translate-chapter:translate-chapter-name'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_LENGTH_BETWEEN', 'translate-chapter:translate-chapter-name', {
                      min: CHAPTER_NAME_MIN,
                      max: CHAPTER_NAME_MAX,
                    }),
                    isLengthBetween(CHAPTER_NAME_MIN, CHAPTER_NAME_MAX),
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group row">
                    <label htmlFor="chapter_name" className="col-md-3 col-form-label">
                      {t('translate-chapter:translate-chapter-name')}
                    </label>
                    <div className="col-md-9">
                      <input
                        {...input}
                        type="text"
                        className="form-control"
                        id="chapter_name"
                        name="chapter_name"
                        placeholder={t('translate-chapter:translate-chapter-name-place-holder')}
                      />
                      <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                    </div>
                  </div>
                )}
              </Field>

              <div className="form-group row">
                <label htmlFor="fiction_lang" className="col-md-3 col-form-label">
                  {t('translate-chapter:original-language')}
                </label>
                <div className="col-md-9">
                  {this.props.originalFiction && this.props.originalFiction.originalFictionLanguage ? (
                    <React.Fragment>
                      <ReactSVG
                        className="flag-icon"
                        src={generateStaticPath('/img/flag/' + this.props.originalFiction.originalFictionLanguage.toLowerCase() + '.svg')}
                      />
                      &nbsp;{t('language-list:' + this.props.originalFiction.originalFictionLanguage.toLowerCase() + '-full')}
                    </React.Fragment>
                  ) : currentChapter ? (
                    <React.Fragment>
                      <ReactSVG
                        className="flag-icon"
                        src={generateStaticPath('/img/flag/' + currentChapter.language.toLowerCase() + '.svg')}
                      />
                      &nbsp;{t('language-list:' + currentChapter.language.toLowerCase() + '-full')}
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
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'translate-chapter:to-language'),
                    required,
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group row">
                    <label htmlFor="chapter_lang_id" className="col-md-3 col-form-label">
                      {t('translate-chapter:to-language')}
                    </label>
                    <div className="col-md-9">
                      <ReactSelect
                        {...input}
                        id="chapter_lang_id"
                        name="chapter_lang_id"
                        options={currentChapter ? this.generateLanguageOptionList() : []}
                        label="chapter_lang_id"
                        placeholder={t('translate-chapter:to-language-place-holder')}
                      />
                      <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                    </div>
                  </div>
                )}
              </Field>
              <div className="form-group row">
                <label htmlFor="fiction_description" className="col-md-3 col-form-label">
                  {t('translate-chapter:content')}
                </label>
                <div className="col-md-9 noselect">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: currentChapter && currentChapter.chapterContent,
                    }}
                  />
                </div>
              </div>
              <Field
                name="content"
                component="textarea"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'translate-chapter:translate-content'),
                    required,
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group row">
                    <label htmlFor="fiction_description" className="col-md-3 col-form-label">
                      {t('translate-chapter:translate-content')}
                    </label>
                    <div className="col-md-9">
                      <SimpleEditor {...input} placeholder={this.props.t('translate-chapter:translate-content-place-holder')} />
                      <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                    </div>
                  </div>
                )}
              </Field>

              <div className="text-center">
                <button type="submit" className="btn btn-secondary" id="save_translate_chapter_button" disabled={invalid || submitting}>
                  <span className="fas fa-plus-circle fa-fw " /> {t('translate-chapter:save-translate-chapter')}
                </button>
              </div>
            </form>
          )}
        />
      </div>
    );
  }
}

TranslateChapterForm.propTypes = {
  t: PropTypes.func.isRequired,
  saveTranslateChapter: PropTypes.func,
  currentUser: PropTypes.object,
  currentChapter: PropTypes.object,
  chapterErrorList: PropTypes.array,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  originalFiction: PropTypes.object,
};

export default TranslateChapterForm;
