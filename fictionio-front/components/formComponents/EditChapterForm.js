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
import SimpleEditor from './FormComponent';
import ReactSVG from 'react-svg';
import Chapter from '../../common/Chapter';
import { generateStaticPath } from '../../util/staticPathUtil';
import { Link } from '../../i18n';

class EditChapterForm extends React.Component {
  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.submitEditChapter = this.submitEditChapter.bind(this);
  }

  submitEditChapter(values) {
    const inputNewChapter = new Chapter();
    inputNewChapter.chapterId = this.props.currentChapter.chapterId;
    inputNewChapter.chapterName = values.chapterName;
    inputNewChapter.chapterContent = values.chapterContent;
    this.props.saveUpdateChapter(this.props.sessionTimeout, this.props.updateAccessToken, this.props.currentUser, inputNewChapter);
  }

  validate(values) {
    const errors = {};
    if (values) {
      if (
        this.props.currentChapter &&
        this.props.currentChapter.language &&
        !matchLanguageOrEnglish(this.props.currentChapter.language.toUpperCase())(values.chapterName)
      ) {
        errors.chapterName = this.props.t('common:error.ERR_FIELD_MISMATCH_LANGUAGE_OR_ENGLISH', {
          field: this.props.t('chapter-new:chapter-name'),
        });
      }
      if (
        this.props.currentChapter &&
        this.props.currentChapter.language &&
        !matchLanguage(this.props.currentChapter.language.toUpperCase())(values.chapterContent)
      ) {
        errors.chapterContent = this.props.t('common:error.ERR_FIELD_MISMATCH_LANGUAGE', {
          field: this.props.t('chapter-new:chapter-content'),
        });
      }
    }
    return errors;
  }

  initializeForm = chapter => {
    return {
      chapterName: chapter ? chapter.chapterName : '',
      chapterContent: chapter ? chapter.chapterContent : '',
    };
  };

  render() {
    const { t, currentChapter } = this.props;
    return (
      <div className="card-body">
        <Form
          initialValues={this.initializeForm(currentChapter)}
          onSubmit={this.submitEditChapter}
          validate={this.validate}
          render={({ handleSubmit, invalid, submitting }) => (
            <form id="chapter_add_form" onSubmit={handleSubmit}>
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
              <Field
                name="chapterName"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'chapter-new:chapter-name'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_LENGTH_BETWEEN', 'chapter-new:chapter-name', {
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
                      {t('chapter-new:chapter-name')}
                    </label>
                    <div className="col-md-9">
                      <input
                        {...input}
                        type="text"
                        className="form-control"
                        id="chapter_name"
                        name="chapter_name"
                        placeholder={t('chapter-new:chapter-name-place-holder')}
                      />
                      <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                    </div>
                  </div>
                )}
              </Field>

              <div className="form-group row">
                <label className="col-md-3 col-form-label">{t('chapter-new:language')}</label>
                <div className="col-md-9">
                  {currentChapter && currentChapter.language ? (
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

              <div className="form-group row">
                <label className="col-md-3 col-form-label">{t('chapter-new:chapter-number')}</label>
                <div className="col-md-9">
                  {currentChapter && currentChapter.isFreeChapter
                    ? t('chapter-new:free-chapter')
                    : currentChapter && currentChapter.displayChapterNumber
                    ? currentChapter.displayChapterNumber
                    : ''}
                </div>
              </div>

              <Field
                name="chapterContent"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'dashboard:chapter-content'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_MISMATCH_LANGUAGE', 'dashboard:chapter-content'),
                    matchLanguage(currentChapter && currentChapter.language ? currentChapter.language.toUpperCase() : 'en'),
                  ),
                )}
              >
                {({ input, meta }) => (
                  <div className="form-group row">
                    <label htmlFor="chapter_content" className="col-md-3 col-form-label">
                      {t('chapter-new:chapter-content')}
                    </label>
                    <div className="col-md-9">
                      <SimpleEditor {...input} placeholder={this.props.t('chapter-new:chapter-content-placeholder')} />
                      <div className="errorMessageShow">{meta.error && meta.touched && <span>{meta.error}</span>}</div>
                    </div>
                  </div>
                )}
              </Field>

              <div className="text-center">
                <div className="col-auto order-1" style={{ display: 'inline' }}>
                  <Link
                    href={'/chapter?chapter=' + (currentChapter ? currentChapter.chapterId : '')}
                    as={'/chapter/' + (currentChapter ? currentChapter.chapterId : '')}
                  >
                    <a role="button" title="Back to chapter" className="btn btn-secondary">
                      <span className="fas fa-undo fa-fw "></span>
                      {t('chapter-new:back')}
                    </a>
                  </Link>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  id="chapter_add_button"
                  disabled={invalid || submitting || this.props.loading}
                >
                  <span className="fas fa-plus-circle fa-fw" /> {t('chapter-new:save-edit-chapter')}
                </button>
              </div>
            </form>
          )}
        />
      </div>
    );
  }
}

EditChapterForm.propTypes = {
  t: PropTypes.func.isRequired,
  errorList: PropTypes.array,
  currentChapter: PropTypes.object,
  currentUser: PropTypes.object,
  saveUpdateChapter: PropTypes.func,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  chapterErrorList: PropTypes.array,
  loading: PropTypes.bool,
};

export default EditChapterForm;
