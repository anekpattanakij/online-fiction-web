import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '../i18n';
import ReactSVG from 'react-svg';
import { generateStaticPath } from '../util/staticPathUtil';
import Fiction from '../common/Fiction';
import * as moment from 'moment';
import Loading from './Loading';

class ProfileFictionArea extends React.Component {
  render() {
    const { t, fictionList, fictionLoading, fictionLoadFail, lng } = this.props;
    return fictionLoadFail ? (
      <div className="alert alert-danger mt-3 text-center" role="alert">
        <strong>{t('update-profile:notice')}:</strong> {t('update-profile:load-fiction-fail')}
      </div>
    ) : !fictionList || fictionLoading ? (
      <div className="tab-content">
        <div className="no-chapter-container text-center">
          <Loading loading={fictionLoading} t={t} />
        </div>
      </div>
    ) : fictionList && fictionList.length > 0 ? (
      <div className="edit tab-content">
        <div className="chapter-container ">
          <div className="row no-gutters">
            <div className="col ">
              <div className="chapter-row d-flex row no-gutters p-2 align-items-center border-bottom odd-row">
                <div className="col col-lg-9 row no-gutters pr-1 order-lg-2">
                  <span className="far fa-book fa-fw " title="Fiction" />
                </div>
                <div className="col-2 col-lg-2 ml-1 text-right order-lg-8">
                  <span className="far fa-clock fa-fw " title="Last Update" />
                </div>
                <div className="w-100 d-lg-none" />
                <div className="col-auto text-center order-lg-4" style={{ flex: '0 0 2.5em' }}>
                  <span className="fas fa-globe fa-fw " title="Language" />
                </div>
              </div>
            </div>
          </div>
          {fictionList.map((fictionItem, key) => (
            <div key={key} className="chapter-row d-flex row no-gutters p-2 align-items-center border-bottom odd-row">
              <div className="col col-lg-9 row no-gutters pr-1 order-lg-2">
                <Link
                  href={'/fiction?fiction=' + fictionItem.fictionId}
                  as={'/fiction/' + fictionItem.fictionId + '/' + encodeURI(Fiction.displayFictionName(fictionItem, lng))}
                >
                  <a>{Fiction.displayFictionName(fictionItem, fictionItem.originalFictionLanguage)}</a>
                </Link>
              </div>
              <div className="col-2 col-lg-2 ml-1 text-right order-lg-8">{moment(fictionItem.createdDate).fromNow()} </div>
              <div className="w-100 d-lg-none" />
              <div className="col-auto text-center order-lg-4" style={{ flex: '0 0 2.5em' }}>
                <ReactSVG
                  className="flag-icon"
                  src={generateStaticPath('/img/flag/' + ('' + fictionItem.originalFictionLanguage).toLowerCase() + '.svg')}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="alert alert-info mt-3 text-center" role="alert">
        <strong>{t('update-profile:notice')}:</strong> {t('update-profile:no-upload-fiction')}
      </div>
    );
  }
}

ProfileFictionArea.propTypes = {
  fictionLoading: PropTypes.bool,
  fictionLoadFail: PropTypes.bool,
  fictionList: PropTypes.array,
  lng: PropTypes.string,
  t: PropTypes.func,
};

export default ProfileFictionArea;
