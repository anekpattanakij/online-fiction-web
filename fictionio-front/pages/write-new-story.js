import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withTranslation, Link } from '../i18n';

class WriteNewFiction extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['write-new-story'],
    };
  }

  render() {
    const { t, currentUser } = this.props;
    return (
      <React.Fragment>
        <Helmet title={t('write-new-story:title')} />
        <ol>
          <li id="write-intro">
            {t('write-new-story:write-intro-header')}
            <ul>
              <li>{t('write-new-story:write-intro1')}</li>
            </ul>
          </li>

          <li id="why-with-us">
            {t('write-new-story:write-why')}
            <ul>
              <li>{t('write-new-story:write-why-sub1')}</li>
              <li>{t('write-new-story:write-why-sub2')}</li>
              <li>{t('write-new-story:write-why-sub3')}</li>
              <li>{t('write-new-story:write-why-sub4')}</li>
            </ul>
          </li>

          <li id="write-owner">
            {t('write-new-story:write-owner')}
            <ul>
              <li>{t('write-new-story:write-owner-sub1')}</li>
              <li>{t('write-new-story:write-owner-sub2')}</li>
              <li>{t('write-new-story:write-owner-sub3')}</li>
              <li>{t('write-new-story:write-owner-sub4')}</li>
            </ul>
          </li>

          <li id="write-content">
            {t('write-new-story:write-content')}
            <ul>
              <li>{t('write-new-story:write-content-sub1')}</li>
              <li>{t('write-new-story:write-content-sub2')}</li>
              <li>{t('write-new-story:write-content-sub3')}</li>
            </ul>
          </li>

          <li id="write-support">
            {t('write-new-story:write-support')}
            <ul>
              <li>{t('write-new-story:write-support-content1')}</li>
              <li>{t('write-new-story:write-support-content2')}</li>
            </ul>
          </li>
        </ol>
        <div className="container">
          <div className="row">
            <div className="col" />
            <div className="col-6  ">
              {currentUser && currentUser.logonStatus ? (
                <Link href="/fiction-new">
                  <button className="btn btn-lg btn-success btn-block" id="start_fiction_button">
                    <span className="fas fa-pencil-alt fa-fw "  />
                    {t('write-new-story:start-new-fiction')}
                  </button>
                </Link>
              ) : (
                <Link href="/login">
                  <button className="btn btn-lg btn-success btn-block" id="login_button">
                    <span className="fas fa-sign-in-alt fa-fw "  />
                    {t('write-new-story:login-to-write')}
                  </button>
                </Link>
              )}
            </div>
            <div className="col" />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

WriteNewFiction.propTypes = {
  t: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
};

const stateToProps = ({ user }) => ({
  currentUser: user.user,
  errorList: user.errorList,
});
const dispatchToProps = {};

export default connect(
  stateToProps,
  dispatchToProps,
)(withTranslation('write-new-story')(WriteNewFiction));
