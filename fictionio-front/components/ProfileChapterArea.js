import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '../i18n';
import ReactSVG from 'react-svg';
import { generateStaticPath } from '../util/staticPathUtil';
import * as moment from 'moment';
import Loading from './Loading';

class ProfileChapterArea extends React.Component {
  render() {
    const { t, chapterList, chapterLoading, chapterLoadFail } = this.props;
    return chapterLoadFail ? (
      <div className="alert alert-danger mt-3 text-center" role="alert">
        <strong>{t('update-profile:notice')}:</strong> {t('update-profile:load-chapter-fail')}
      </div>
    ) : !chapterList || chapterLoading ? (
      <div className="tab-content">
        <div className="no-chapter-container text-center">
          <Loading loading={chapterLoading} t={t} />
        </div>
      </div>
    ) : chapterList && chapterList.length > 0 ? (
      <div className="edit tab-content">
        <div className="chapter-container ">
          <div className="row no-gutters">
            <div className="col ">
              <div className="chapter-row d-flex row no-gutters p-2 align-items-center border-bottom odd-row">
                <div className="col col-lg-9 row no-gutters pr-1 order-lg-2">
                  <span className="far fa-file fa-fw " title="Chapter" />
                </div>
                <div className="col-2 col-lg-2 ml-1 text-right order-lg-8">
                  <span className="far fa-clock fa-fw " title="Last Update" />
                </div>
                <div className="w-100 d-lg-none" />
                <div className="col-auto text-center order-lg-4" style={{ flex: '0 0 2.5em' }}>
                  <span className="fas fa-globe fa-fw " title="Language" />
                </div>
                <div className="col order-lg-5">
                  <span className="fas fa-money-bill-wave fa-fw " title="Purchase Count" />
                </div>
              </div>
            </div>
          </div>
          {chapterList.map((chapterItem, key) => (
            <div key={key} className="chapter-row d-flex row no-gutters p-2 align-items-center border-bottom odd-row">
              <div className="col col-lg-9 row no-gutters pr-1 order-lg-2">
                <Link href={'/chapter?chapter=' + chapterItem.chapterId} as={'/chapter/' + chapterItem.chapterId}>
                  <a>
                    {chapterItem.displayChapterNumber === 0
                      ? t('update-profile:special')
                      : t('update-profile:chapter') + chapterItem.displayChapterNumber}{' '}
                    - {chapterItem.chapterName}
                  </a>
                </Link>
              </div>
              <div className="col-2 col-lg-2 ml-1 text-right order-lg-8">{moment(chapterItem.lastUpdate).fromNow()} </div>
              <div className="w-100 d-lg-none" />
              <div className="col-auto text-center order-lg-4" style={{ flex: '0 0 2.5em' }}>
                <ReactSVG
                  className="flag-icon"
                  src={generateStaticPath('/img/flag/' + ('' + chapterItem.language).toLowerCase() + '.svg')}
                />
              </div>
              <div className="col order-lg-5">{chapterItem.purchaseCount || 0}</div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="alert alert-info mt-3 text-center" role="alert">
        <strong>{t('update-profile:notice')}:</strong> {t('update-profile:no-upload-chapter')}
      </div>
    );
  }
}

ProfileChapterArea.propTypes = {
  chapterLoading: PropTypes.bool,
  chapterLoadFail: PropTypes.bool,
  chapterList: PropTypes.array,
  t: PropTypes.func,
};

export default ProfileChapterArea;
