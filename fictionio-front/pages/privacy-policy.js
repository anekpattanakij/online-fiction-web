import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { withTranslation } from '../i18n';

class PrivacyProtection extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'privacy-policy'],
    };
  }

  render() {
    const { t } = this.props;
    return (
      <React.Fragment>
        <Helmet title={t('title')} />
        {t('privacy-policy:privacy-header')}
        <ol>
          <li id="privacy-intro">
            {t('privacy-policy:privacy-header')}
            <ul>
              <li>{t('privacy-policy:privacy-intro1')}</li>
              <li>{t('privacy-policy:privacy-intro2')}</li>
              <li>{t('privacy-policy:privacy-intro3')}</li>
            </ul>
          </li>

          <li id="information-use">
            {t('privacy-policy:information-use')}
            <ul>
              <li>{t('privacy-policy:information-use-content1')}</li>
            </ul>
          </li>

          <li id="type-data">
            {t('privacy-policy:type-data')}
            <ul>
              <li>{t('type-data-content1')}</li>
              <ul>
                <li>{t('type-data-personal-info')}</li>
                <li>{t('type-data-promotion')}</li>
                <li>{t('type-data-payment')}</li>
                <li>{t('type-data-cookie')}</li>
              </ul>
            </ul>
          </li>

          <li id="usage-data">
            {t('privacy-policy:usage-data')}
            <ul>
              <li>{t('usage-data-content1')}</li>
            </ul>
          </li>

          <li id="tracking">
            {t('privacy-policy:tracking')}
            <ul>
              <li>{t('tracking-content1')}</li>
              <li>{t('tracking-content2')}</li>
              <li>{t('tracking-content3')}</li>
            </ul>
          </li>

          <li id="user-of-data">
            {t('privacy-policy:use-of-data')}
            <ul>
              <li>{t('use-of-data-content1')}</li>
              <ul>
                <li>{t('use-of-data-bullet1')}</li>
                <li>{t('use-of-data-bullet2')}</li>
                <li>{t('use-of-data-bullet3')}</li>
                <li>{t('use-of-data-bullet4')}</li>
                <li>{t('use-of-data-bullet5')}</li>
                <li>{t('use-of-data-bullet6')}</li>
                <li>{t('use-of-data-bullet7')}</li>
              </ul>
            </ul>
          </li>

          <li id="disclosure-data">
            {t('privacy-policy:disclosure-data')}
            <ul>
              <li>{t('legal-requirements-content1')}</li>
              <ul>
                <li>{t('legal-requirements-bullet1')}</li>
                <li>{t('legal-requirements-bullet2')}</li>
                <li>{t('legal-requirements-bullet3')}</li>
                <li>{t('legal-requirements-bullet4')}</li>
                <li>{t('legal-requirements-bullet5')}</li>
              </ul>
            </ul>
          </li>

          <li id="security">
            {t('privacy-policy:security')}
            <ul>
              <li>{t('security-content1')}</li>
            </ul>
          </li>
          <li id="provider">
            {t('privacy-policy:provider')}
            <ul>
              <li>{t('provider-content1')}</li>
              <li>{t('provider-content2')}</li>
            </ul>
          </li>
          <li id="link">
            {t('privacy-policy:link')}
            <ul>
              <li>{t('link-content1')}</li>
              <li>{t('link-content2')}</li>
            </ul>
          </li>

          <li id="change">
            {t('privacy-policy:change')}
            <ul>
              <li>{t('change-content1')}</li>
              <li>{t('change-content2')}</li>
            </ul>
          </li>
          <li id="contact">
            {t('privacy-policy:contact')}
            <ul>
              <li>{t('contact-content1')}</li>
              <li>{t('contact-email')}</li>
              <li>{t('contact-site')}</li>
            </ul>
          </li>
        </ol>
      </React.Fragment>
    );
  }
}

PrivacyProtection.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('privacy-policy')(PrivacyProtection);
