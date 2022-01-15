import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { withTranslation } from '../i18n';

class AboutUs extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'about-us'],
    };
  }

  render() {
    const { t } = this.props;
    return (
      <div className="container" role="main" id="content">
        <Helmet title={t('about-us:about-us-title')} />

        <p>{t('about-us:general-information')}</p>
        <h5 style={{ borderBottom: '1px solid #000000' }}>{t('about-us:contact-us')}</h5>
        <ul>
          <li>{t('about-us:email')}</li>
        </ul>
      </div>
    );
  }
}

AboutUs.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('about-us')(AboutUs);
