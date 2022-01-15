import React from 'react';
import PropTypes from 'prop-types';
import Fiction from '../../common/Fiction';
import { generateCoverPath } from '../../util/staticPathUtil';
import { Link } from '../../i18n';
import FictionioCover from '../FictionioCover';

class FeatureFictionCard extends React.Component {
  render() {
    const { fiction, lng } = this.props;
    return (
      <div style={{ width: '178px', marginRight: '10px' }}>
        <div className="large_logo rounded">
          <div className="hover">
            <Link
              href={'/fiction?fiction=' + fiction.fictionId}
              as={'/fiction/' + fiction.fictionId + '/' + encodeURI(Fiction.displayFictionName(fiction, lng))}
            >
              <a>
                {fiction && fiction.cover && fiction.cover !== '' ? (
                  <img
                    title={Fiction.displayFictionName(fiction, lng)}
                    src={generateCoverPath(fiction.cover)}
                    className="owl-lazy rounded"
                    style={{ opacity: 1, width: '130px', height: '190px' }}
                  />
                ) : (
                  <FictionioCover width={130} height={190} />
                )}
              </a>
            </Link>
          </div>
          <div className="px-2 py-0" style={{ backgroundColor: '#626d80', position: 'absolute', width: '130px' }}>
            <p className="text-truncate m-0">
              <Link
                href={'/fiction?fiction=' + fiction.fictionId}
                as={'/fiction/' + fiction.fictionId + '/' + encodeURI(Fiction.displayFictionName(fiction, lng))}
              >
                <a style={{ color: 'white' }} title={Fiction.displayFictionName(fiction, lng)}>
                  {fiction && Fiction.displayFictionName(fiction, lng)}
                </a>
              </Link>
            </p>
            <p className="m-0">
              <span title="Rating" className="float-right" style={{ color: 'white' }}>
                <span className="fas fa-star fa-fw " title="rating" />
                {fiction && fiction.rating.toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

FeatureFictionCard.propTypes = {
  fiction: PropTypes.object,
  lng: PropTypes.string,
};

export default FeatureFictionCard;
