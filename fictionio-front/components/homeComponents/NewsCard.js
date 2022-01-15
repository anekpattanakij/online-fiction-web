import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from '../../i18n';

class NewsCard extends React.Component {
  render() {
    const { t } = this.props;
    return this.props.newsList
      ? this.props.newsList.map((newsItem, keyIndex) =>
          newsItem.language.toUpperCase() == this.props.lng.toUpperCase() ? (
            <div className="card mb-3 " key={keyIndex}>
              <h6 className="card-header text-center"> {t('home-news')}</h6>
              <ul className="list-group list-group-flush">
                <li className="list-group-item px-2 py-1">
                  <p className="pt-0 pb-1 mb-1 border-bottom">{newsItem.message}</p>
                </li>
              </ul>
            </div>
          ) : (
            ''
          ),
        )
      : '';
  }
}

NewsCard.propTypes = {
  t: PropTypes.func.isRequired,
  newsList: PropTypes.array,
  lng: PropTypes.string,
};

export default withTranslation('home')(NewsCard);
