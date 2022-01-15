import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { withTranslation } from '../i18n';

class NoAuthorizePage extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common'],
    };
  }

  render() {
    const { t } = this.props;
    return (
      <React.Fragment>
        <Helmet title={t('common:no-authorize-title')} />
        <div className="alert alert-danger text-center mt-2" role="alert">
          <strong>{this.props.t('common:user-no-authorize')}</strong>
        </div>
      </React.Fragment>
    );
  }
}

NoAuthorizePage.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('common')(NoAuthorizePage);
