import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withTranslation, Link } from '../i18n';
import { withRouter } from 'next/router';
import { loadFiction } from '../redux-saga/action/fictionAction';
import TranslateFictionForm from '../components/formComponents/TranslateFictionForm';
import { saveTranslateFiction } from '../redux-saga/action/fictionAction';
import { sessionTimeout, updateAccessToken } from '../redux-saga/action/userAction';
import SecurePageWrapper from '../hoc/securePageWrapper';
import { ERROR_CODE_FICTION_NOT_EXIST, ERROR_CODE_NETWORK_ERROR } from '../common/Error';
import Fiction from '../common/Fiction';
import '../static/css/blank.css';

class TranslateFiction extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (
      !this.props.currentFiction ||
      !this.props.currentFiction.fictionId ||
      this.props.currentFiction.fictionId !== this.props.router.query['translate-fiction']
    ) {
      this.props.loadFiction(this.props.router.query['translate-fiction']);
    }
  }

  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'translate-fiction', 'language-list', 'pricing-model'],
    };
  }

  render() {
    const { t, fictionErrorList, saveOrEditFictionResult } = this.props;
    let networkError = false;
    if (fictionErrorList && fictionErrorList.length > 0) {
      fictionErrorList.map(errorItem => {
        if (errorItem && errorItem.code && errorItem.code === ERROR_CODE_FICTION_NOT_EXIST) {
          this.props.router.push('/content-not-found');
        }
        if (errorItem && errorItem.code && errorItem.code === ERROR_CODE_NETWORK_ERROR) {
          networkError = true;
        }
      });
    }
    if (saveOrEditFictionResult !== '' && (!saveOrEditFictionResult.fictionId || !saveOrEditFictionResult.fictionName)) {
      this.props.router.push('/no-authorized');
    }
    return (
      <div className="container" role="main" id="content">
        {networkError ? (
          <div className="alert alert-danger text-center mt-2" role="alert">
            <strong>{t('common:error.ERROR_CODE_DATABASE_CONNECTION')}</strong>
          </div>
        ) : (
          <React.Fragment>
            <Helmet
              title={
                t('translate-fiction:fiction-translate-title') +
                ' - ' +
                Fiction.getFictionName(
                  this.props.currentFiction,
                  this.props.currentFiction ? this.props.currentFiction.originalFictionLanguage : '',
                )
              }
            />
            {saveOrEditFictionResult !== '' ? (
              <div className="alert alert-success text-center mt-2" role="alert">
                <Link
                  href={'/fiction?fiction=' + ('' + (saveOrEditFictionResult && saveOrEditFictionResult.fictionId))}
                  as={'/fiction/' + ('' + (saveOrEditFictionResult && saveOrEditFictionResult.fictionId))}
                >
                  <a>
                    <strong>
                      {this.props.t('translate-fiction:fiction-translate-success', {
                        fictionname:
                          saveOrEditFictionResult && saveOrEditFictionResult.fictionName ? saveOrEditFictionResult.fictionName : '',
                      })}
                    </strong>
                  </a>
                </Link>
              </div>
            ) : fictionErrorList && Array.isArray(fictionErrorList) && fictionErrorList.length > 0 ? (
              <div className="alert alert-danger text-center mt-2" role="alert">
                <strong>{this.props.t('common:error.' + fictionErrorList[0].code)}</strong>
              </div>
            ) : (
              <div className="card my-3">
                <h6 className="card-header">
                  <span className="fas fa-plus-circle fa-fw " /> {t('translate-fiction:fiction-translate-header')}
                </h6>
                <TranslateFictionForm {...this.props} lng={this.props.i18n.language} />
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

TranslateFiction.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
  saveTranslateFiction: PropTypes.func.isRequired,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  loadFiction: PropTypes.func,
  currentUser: PropTypes.object,
  fictionErrorList: PropTypes.array,
  fictionLoading: PropTypes.bool,
  currentFiction: PropTypes.object,
  saveOrEditFictionResult: PropTypes.string,
  i18n: PropTypes.object,
};

const stateToProps = ({ user, fiction }) => ({
  currentUser: user.user,
  fictionErrorList: fiction.errorList,
  fictionLoading: fiction.loading,
  currentFiction: fiction.currentFiction,
  saveOrEditFictionResult: fiction.saveOrEditFictionResult,
});
const dispatchToProps = {
  saveTranslateFiction,
  sessionTimeout,
  updateAccessToken,
  loadFiction,
};

TranslateFiction.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
};

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation(['translate-fiction', 'language-list', 'pricing-model'])(withRouter(SecurePageWrapper(TranslateFiction)))));
