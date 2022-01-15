import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from '../../i18n';

class ServiceAnnoucementCard extends React.Component {
  render() {
    const { t } = this.props;
    return (
      <div className="card mb-3 ">
        <h6 className="card-header text-center">{t('home-service-annoucement')}</h6>
        <div className="card-body text-center">
          The DDoS continues, and so does mitigation. Please be patient with the site during these difficult times...
        </div>
      </div>
    );
  }
}

ServiceAnnoucementCard.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('home')(ServiceAnnoucementCard);
