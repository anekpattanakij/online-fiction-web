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

class NewChapterForm extends React.Component {
  state = {
    freeChapter: false,
  };

  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.submitNewChapter = this.submitNewChapter.bind(this);
    this.resetChapterNumber = this.resetChapterNumber.bind(this);
  }

  submitNewChapter(values) {
    const inputNewChapter = new Chapter();
    inputNewChapter.fictionId = this.props.currentFiction.fictionId;
    inputNewChapter.chapterName = values.chapterName;
    inputNewChapter.chapterContent = values.chapterContent;
    inputNewChapter.language = this.props.currentFiction.originalFictionLanguage;
    inputNewChapter.isFreeChapter = values.FreeChapter ? true : false;
    this.props.saveNewChapter(this.props.sessionTimeout, this.props.updateAccessToken, this.props.currentUser, inputNewChapter);
  }

  validate(values) {
    const errors = {};
    if (values) {
      if (values.originalLanguage && !matchLanguageOrEnglish(values.originalLanguage.value.toUpperCase())(values.fictionName)) {
        errors.fictionName = this.props.t('common:error.ERR_FIELD_MISMATCH_LANGUAGE_OR_ENGLISH', {
          field: this.props.t('fiction-new:fiction-name'),
        });
      }
    }
    this.setState({ genresSelected: values.genres && values.genres.length > 0 });
    return errors;
  }

  resetChapterNumber(e) {
    this.setState({ freeChapter: e.target.checked });
  }

  initializeForm = () => {
    return {
      chapterName: '',
      chapterContent: '',
    };
  };

  render() {
    const { t, currentFiction } = this.props;
    return (
      <div className="card-body">
        <Form
          initialValues={this.initializeForm()}
          onSubmit={this.submitNewChapter}
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
                <label className="col-md-3 col-form-label">{t('chapter-new:original-language')}</label>
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
                <label className="col-md-3 col-form-label">{t('chapter-new:chapter-number')}</label>
                <div className="col-md-9">
                  {this.state.freeChapter
                    ? t('chapter-new:free-chapter')
                    : currentFiction && Number.isInteger(parseInt(currentFiction.lastChapter))
                    ? parseInt(currentFiction.lastChapter) + 1
                    : ''}
                </div>
              </div>

              <Field name="FreeChapter" component="input" type="checkbox">
                {({ input }) => (
                  <div className="form-group row">
                    <label htmlFor="free-chapter" className="col-md-3 col-form-label">
                      <span className="label label-danger"> {t('chapter-new:free-chapter')}</span>
                    </label>
                    <div className="col-md-9">
                      <div className="custom-control custom-checkbox form-check">
                        <input
                          {...input}
                          type="checkbox"
                          className="custom-control-input"
                          id="free-chapter"
                          name="free-chapter"
                          value="true"
                          onClick={e => this.resetChapterNumber(e)}
                        />
                        <label className="custom-control-label" htmlFor="free-chapter">
                          &nbsp;
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </Field>
              <Field
                name="chapterContent"
                validate={composeValidators(
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_REQUIRED', 'dashboard:chapter-content'),
                    required,
                  ),
                  compose(
                    getErrorMessage(this.props.t, 'common:error.ERR_FIELD_MISMATCH_LANGUAGE', 'dashboard:chapter-content'),
                    matchLanguage(((currentFiction && currentFiction.originalFictionLanguage) || 'en').toUpperCase()),
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
                    href={'/fiction?fiction=' + (currentFiction ? currentFiction.fictionId : '')}
                    as={'/fiction/' + (currentFiction ? currentFiction.fictionId : '')}
                  >
                    <a role="button" title="Back to fiction" className="btn btn-secondary">
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
                  style={{ display: 'inline' }}
                >
                  <span className="fas fa-plus-circle fa-fw " /> {t('chapter-new:add-new-chapter')}
                </button>
              </div>
            </form>
          )}
        />
      </div>
    );
  }
}

NewChapterForm.propTypes = {
  t: PropTypes.func.isRequired,
  errorList: PropTypes.array,
  currentFiction: PropTypes.object,
  currentUser: PropTypes.object,
  saveNewChapter: PropTypes.func,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  chapterErrorList: PropTypes.array,
  loading: PropTypes.bool,
};

export default NewChapterForm;
