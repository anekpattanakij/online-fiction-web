import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from '../i18n';

class Footer extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['footer'],
    };
  }

  render() {
    const { t } = this.props;
    return (
      <footer className="footer">
        <p className="m-0 text-center text-muted">{t('footer:footer-text')}</p>
      </footer>
    );
  }
}

Footer.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('footer')(Footer);
