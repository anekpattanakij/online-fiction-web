import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withTranslation, Link } from '../i18n';
import { withRouter } from 'next/router';
import { loadFiction } from '../redux-saga/action/fictionAction';
import EditFictionForm from '../components/formComponents/EditFictionForm';
import { saveUpdateFiction } from '../redux-saga/action/fictionAction';
import { sessionTimeout, updateAccessToken } from '../redux-saga/action/userAction';
import SecurePageWrapper from '../hoc/securePageWrapper';
import { ERROR_CODE_FICTION_NOT_EXIST, ERROR_CODE_NETWORK_ERROR } from '../common/Error';
import Fiction from '../common/Fiction';
import { API_CALLING_METHOD, callNonSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../common/ApiPortal';
import Config from '../config/index';

class EditFiction extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (
      !this.props.currentFiction ||
      !this.props.currentFiction.fictionId ||
      this.props.currentFiction.fictionId !== this.props.router.query['edit-fiction']
    ) {
      this.props.loadFiction(this.props.router.query['edit-fiction']);
    }
  }

  componentDidUpdate() {
    if (this.props.currentFiction && this.props.currentFiction.fictionId === this.props.router.query.fiction) {
      if (
        this.props.currentFiction.author &&
        this.props.currentUser &&
        this.props.currentFiction.author.cif !== this.props.currentUser.cif
      ) {
        this.props.router.push('/no-authorized');
      }
    }
  }

  static async getInitialProps() {
    const API_LOAD_GENRES_LIST = Config.apiPath + '/genres';
    let genresList = [];
    await callNonSecureApi(API_LOAD_GENRES_LIST, API_CALLING_METHOD.GET).then(genresResponse => {
      if (genresResponse.result === RETURN_CODE_API_CALL_SUCCESS && genresResponse.data) {
        genresList = genresResponse.data;
      }
    });
    return {
      genresList: genresList,
      namespacesRequired: ['common', 'fiction-new', 'language-list', 'genres', 'pricing-model'],
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
                t('fiction-new:fiction-edit-title') +
                ' - ' +
                Fiction.getFictionName(
                  this.props.currentFiction,
                  this.props.currentFiction ? this.props.currentFiction.originalFictionLanguage : '',
                )
              }
            />
            {saveOrEditFictionResult !== '' ? (
              <div className="alert alert-success text-center mt-2" role="alert">
                <strong>
                  <Link
                    href={'/fiction?fiction=' + ('' + (saveOrEditFictionResult && saveOrEditFictionResult.fictionId))}
                    as={'/fiction/' + ('' + (saveOrEditFictionResult && saveOrEditFictionResult.fictionId))}
                  >
                    <a>
                      {this.props.t('fiction-new:fiction-edit-success', {
                        fictionname:
                          saveOrEditFictionResult && saveOrEditFictionResult.fictionName ? saveOrEditFictionResult.fictionName : '',
                      })}
                    </a>
                  </Link>
                </strong>
              </div>
            ) : (
              <div className="card my-3">
                <h6 className="card-header">
                  <span className="fas fa-plus-circle fa-fw " /> {t('fiction-new:fiction-edit-header')}
                </h6>
                <EditFictionForm {...this.props} />
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

EditFiction.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
  loadGenres: PropTypes.func.isRequired,
  genresList: PropTypes.array,
  saveUpdateFiction: PropTypes.func.isRequired,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  loadFiction: PropTypes.func,
  currentUser: PropTypes.object,
  fictionErrorList: PropTypes.array,
  fictionLoading: PropTypes.bool,
  currentFiction: PropTypes.object,
  saveOrEditFictionResult: PropTypes.string,
};

const stateToProps = ({ user, fiction }) => ({
  currentUser: user.user,
  fictionErrorList: fiction.errorList,
  fictionLoading: fiction.loading,
  currentFiction: fiction.currentFiction,
  saveOrEditFictionResult: fiction.saveOrEditFictionResult,
});
const dispatchToProps = {
  saveUpdateFiction,
  sessionTimeout,
  updateAccessToken,
  loadFiction,
};

EditFiction.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
};

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation(['fiction-new', 'language-list', 'genres', 'pricing-model'])(withRouter(SecurePageWrapper(EditFiction)))));
