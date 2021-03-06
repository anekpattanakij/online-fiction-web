import React from 'react'
import PropTypes from 'prop-types'

import { withTranslation } from '../i18n'

class Error extends React.Component {
  static async getInitialProps({ res, err }) {
    let statusCode = null
    if (res) {
      ({ statusCode } = res)
    } else if (err) {
      ({ statusCode } = err)
    }
    return {
      namespacesRequired: ['common'],
      statusCode,
    }
  }

  render() {
    const { statusCode, t } = this.props
    return (
      <p>
        {statusCode
          ? t('error-with-status', { statusCode })
          : t('error-without-status')}
      </p>
    )
  }
}

Error.defaultProps = {
  statusCode: null,
}

Error.propTypes = {
  statusCode: PropTypes.number,
  t: PropTypes.func.isRequired,
}

export default withTranslation('common')(Error)
