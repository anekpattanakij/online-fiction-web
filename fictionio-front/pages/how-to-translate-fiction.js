import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withTranslation } from '../i18n';

class StartTranslateFiction extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'start-translate-fiction'],
    };
  }

  render() {
    const { t } = this.props;
    return (
      <React.Fragment>
        <Helmet title={t('start-translate-fiction:title')} />
        <ol>
          <li id="translate-intro">
            {t('start-translate-fiction:translate-intro-header')}
            <ul>
              <li>{t('start-translate-fiction:translate-intro1')}</li>
            </ul>
          </li>

          <li id="why-with-us">
            {t('start-translate-fiction:translate-why')}
            <ul>
              <li>{t('start-translate-fiction:translate-why-sub1')}</li>
              <li>{t('start-translate-fiction:translate-why-sub2')}</li>
              <li>{t('start-translate-fiction:translate-why-sub3')}</li>
            </ul>
          </li>

          <li id="translate-content">
            {t('start-translate-fiction:translate-content')}
            <ul>
              <li>{t('start-translate-fiction:translate-content-sub1')}</li>
              <li>{t('start-translate-fiction:translate-content-sub2')}</li>
            </ul>
          </li>

          <li id="translate-support">
            {t('start-translate-fiction:translate-support')}
            <ul>
              <li>{t('start-translate-fiction:translate-support-content1')}</li>
            </ul>
          </li>
        </ol>
      </React.Fragment>
    );
  }
}

StartTranslateFiction.propTypes = {
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
)(withTranslation('start-translate-fiction')(StartTranslateFiction));
