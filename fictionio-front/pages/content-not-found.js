import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from '../i18n';

class Error extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common'],
    };
  }

  render() {
    const { t } = this.props;
    return (
      <div className="alert alert-danger text-center" role="alert">
        <strong>{t('common:error.ERROR_CODE_FICTION_NOT_EXIST')}</strong>{' '}
      </div>
    );
  }
}

Error.defaultProps = {
  statusCode: null,
};

Error.propTypes = {
  statusCode: PropTypes.number,
  t: PropTypes.func.isRequired,
};

export default withTranslation('common')(Error);
