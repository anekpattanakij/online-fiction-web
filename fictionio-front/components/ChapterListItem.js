import React from 'react';
import PropTypes from 'prop-types';
import { FICTION_STATUS } from '../config/fictionStatusList';
import { Link } from '../i18n';
import ReactSVG from 'react-svg';
import { generateStaticPath } from '../util/staticPathUtil';
import * as moment from 'moment';
import CoinIcon from './CoinIcon';

class ChapterListItem extends React.Component {
  render() {
    const { chapter, t } = this.props;
    return (
      <div className="row no-gutters">
        <div className="col ">
          <div className="chapter-row d-flex row no-gutters p-2 align-items-center border-bottom odd-row">
            <div className="col col-lg-5 row no-gutters align-items-center flex-nowrap text-truncate pr-1 order-lg-2">
              <Link
                href={'/chapter?chapter=' + (chapter ? chapter.chapterId : '')}
                as={'/chapter/' + (chapter ? chapter.chapterId + '/' + encodeURI(chapter.chapterName) : '')}
              >
                <a className="text-truncate">
                  {chapter.displayChapterNumber === 0 ? t('fiction:special') : chapter.displayChapterNumber} - {chapter.chapterName}
                </a>
              </Link>
              <div>
                {' '}
                {chapter.status === FICTION_STATUS.DRAFT ? <span className="badge badge-primary mx-1">{t('fiction:draft')}</span> : ''}
              </div>
            </div>
            <div className="col-2 col-lg-2 ml-1 text-right text-truncate order-lg-8 " title="2018-04-25 16:36:37 UTC">
              {moment(chapter.lastUpdate).fromNow()}{' '}
            </div>
            <div className="w-100 d-lg-none" />
            <div className="chapter-list-flag col-auto text-center order-lg-4" style={{ flex: '0 0 2.5em' }}>
              <ReactSVG className="flag-icon" src={generateStaticPath('/img/flag/' + ('' + chapter.language).toLowerCase() + '.svg')} />
            </div>
            <div className="chapter-list-group col text-truncate order-lg-5">
              {chapter.coin > 0 ? (
                <React.Fragment>
                  {chapter.coin} <CoinIcon />
                </React.Fragment>
              ) : (
                t('common:free')
              )}
            </div>
            <div className="chapter-list-uploader col-auto col-lg-1 text-truncate text-right mx-1 order-lg-6">
              <Link
                href={'/user?user=' + (chapter ? chapter.author.cif : '')}
                as={'/user/' + (chapter ? chapter.author.cif + '/' + encodeURI(chapter.author.displayName) : '')}
              >
                <a>{chapter.author ? chapter.author.displayName : ''}</a>
              </Link>
            </div>
            <div className="chapter-list-views col-2 col-lg-1 text-right text-info text-truncate order-lg-7">
              <span className="d-none d-md-inline d-lg-none d-xl-inline">{chapter.totalCount}</span>
              <span className="d-inline d-md-none d-lg-inline d-xl-none" title={chapter.totalCount}>
                {chapter.totalCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ChapterListItem.propTypes = {
  chapter: PropTypes.object,
  t: PropTypes.func,
};

export default ChapterListItem;
