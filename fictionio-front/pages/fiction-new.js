import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withTranslation, Link } from '../i18n';
import { withRouter } from 'next/router';
import NewFictionForm from '../components/formComponents/NewFictionForm';
import { saveNewFiction, resetCurrentFiction } from '../redux-saga/action/fictionAction';
import { sessionTimeout, updateAccessToken } from '../redux-saga/action/userAction';
import SecurePageWrapper from '../hoc/securePageWrapper';
import { API_CALLING_METHOD, callNonSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../common/ApiPortal';
import Config from '../config/index';
import '../static/css/blank.css';

class FictionNew extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.resetCurrentFiction();
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
    const { t, saveOrEditFictionResult, fictionErrorList } = this.props;
    if (saveOrEditFictionResult !== '' && (!saveOrEditFictionResult.fictionId || !saveOrEditFictionResult.fictionName)) {
      this.props.router.push('/no-authorized');
    }
    return (
      <div className="container" role="main" id="content">
        <Helmet title={t('fiction-new:fiction-new-title')} />
        {saveOrEditFictionResult !== '' ? (
          <div className="alert alert-success text-center mt-2" role="alert">
            <strong>
              <Link
                href={'/fiction?fiction=' + ('' + (saveOrEditFictionResult && saveOrEditFictionResult.fictionId))}
                as={'/fiction/' + ('' + (saveOrEditFictionResult && saveOrEditFictionResult.fictionId))}
              >
                <a>
                  {this.props.t('fiction-new:fiction-new-success', {
                    fictionname: saveOrEditFictionResult && saveOrEditFictionResult.fictionName ? saveOrEditFictionResult.fictionName : '',
                  })}
                </a>
              </Link>
            </strong>
          </div>
        ) : fictionErrorList && Array.isArray(fictionErrorList) && fictionErrorList.length > 0 ? (
          <div className="alert alert-danger text-center mt-2" role="alert">
            <strong>{this.props.t('common:error.' + fictionErrorList[0].code)}</strong>
          </div>
        ) : (
          <div className="card my-3">
            <h6 className="card-header">
              <span className="fas fa-plus-circle fa-fw " /> {t('fiction-new:fiction-new-header')}
            </h6>
            <NewFictionForm {...this.props} />
          </div>
        )}
      </div>
    );
  }
}

FictionNew.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
  fictionErrorList: PropTypes.array,
  genresList: PropTypes.array,
  saveNewFiction: PropTypes.func.isRequired,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
  saveOrEditFictionResult: PropTypes.string,
  resetCurrentFiction: PropTypes.func,
  loading: PropTypes.bool,
};

const stateToProps = ({ user, fiction }) => ({
  currentUser: user.user,
  fictionErrorList: fiction.errorList,
  saveOrEditFictionResult: fiction.saveOrEditFictionResult,
  loading: fiction.loading,
});
const dispatchToProps = {
  saveNewFiction,
  sessionTimeout,
  updateAccessToken,
  resetCurrentFiction,
};

FictionNew.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
};

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation(['fiction-new', 'language-list', 'genres', 'pricing-model'])(withRouter(SecurePageWrapper(FictionNew)))));
