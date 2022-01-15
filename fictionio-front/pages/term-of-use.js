import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { withTranslation } from '../i18n';

class TermOfUse extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'term-of-use'],
    };
  }

  render() {
    const { t } = this.props;
    return (
      <React.Fragment>
        <Helmet title={t('title')} />
        {t('term-of-use:agreement-header')}
        <ol>
          <li>{t('term-of-use:agreement-bullet1')}</li>
          <li>{t('term-of-use:agreement-bullet2')}</li>
          <li>{t('term-of-use:agreement-bullet3')}</li>
          <li>{t('term-of-use:agreement-bullet4')}</li>
          <li>{t('term-of-use:agreement-bullet5')}</li>
          <li>{t('term-of-use:agreement-bullet6')}</li>
          <li>{t('term-of-use:agreement-bullet7')}</li>
          <li>{t('term-of-use:agreement-bullet8')}</li>
          <li>{t('term-of-use:agreement-bullet9')}</li>
          <li>{t('term-of-use:agreement-bullet10')}</li>
          <li>{t('term-of-use:agreement-bullet11')}</li>
          <li>{t('term-of-use:agreement-bullet12')}</li>
          <li>{t('term-of-use:agreement-bullet13')}</li>
          <li>{t('term-of-use:agreement-bullet14')}</li>
          <li>{t('term-of-use:agreement-bullet15')}</li>
          <li>{t('term-of-use:agreement-bullet16')}</li>
          <li>{t('term-of-use:agreement-bullet17')}</li>
          <li>{t('term-of-use:agreement-bullet18')}</li>
          <li>{t('term-of-use:agreement-bullet19')}</li>
        </ol>
      </React.Fragment>
    );
  }
}

TermOfUse.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('term-of-use')(TermOfUse);
