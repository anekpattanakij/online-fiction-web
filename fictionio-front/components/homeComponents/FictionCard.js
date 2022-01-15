import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '../../i18n';
import * as moment from 'moment';
import { generateCoverPath } from '../../util/staticPathUtil';
import FictionioCover from '../FictionioCover';
import ReactSVG from 'react-svg';
import { generateStaticPath } from '../../util/staticPathUtil';

class FictionCard extends React.Component {
  render() {
    const { t, chapter } = this.props;
    return (
      <div className="col-md-6 border-bottom p-2">
        <div className="hover sm_md_logo rounded float-left mr-2">
          <Link
            href={'/chapter?chapter=' + (chapter ? chapter.chapterId : '')}
            as={'/chapter/' + (chapter ? chapter.chapterId + '/' + encodeURI(chapter.chapterName) : '')}
          >
            <a>
              {chapter && chapter.displayCover && chapter.displayCover !== '' ? (
                <img
                  className="rounded max-width"
                  src={generateCoverPath(chapter.displayCover)}
                  style={{ width: '80px', height: '106px' }}
                />
              ) : (
                <FictionioCover width={80} height={106} />
              )}
            </a>
          </Link>
        </div>
        <div className="pt-0 pb-1 mb-1 border-bottom d-flex align-items-center flex-nowrap">
          <div>
            <span className="fas fa-book fa-fw mr-1" />
          </div>
          <Link
            href={'/fiction?fiction=' + (chapter ? chapter.fictionId : '')}
            as={'/fiction/' + (chapter ? chapter.fictionId + '/' + encodeURI(chapter.fictionDisplayName) : '')}
          >
            <a className=" text-truncate">{chapter && chapter.fictionDisplayName}</a>
          </Link>
        </div>
        <div className="py-0 mb-1 row no-gutters align-items-center flex-nowrap">
          <span className="far fa-file fa-fw col-auto mr-1" />
          <Link
            href={'/chapter?chapter=' + (chapter ? chapter.chapterId : '')}
            as={'/chapter/' + (chapter ? chapter.chapterId + '/' + encodeURI(chapter.chapterName) : '')}
          >
            <a className="text-truncate" style={{ flex: '0 1 auto' }}>
              {!chapter || chapter.displayChapterNumber === 0
                ? t('common:special') + ' '
                : t('home:short-chapter') + chapter.displayChapterNumber + ' '}
              {chapter && chapter.chapterName}
            </a>
          </Link>
          <div className="ml-1">
            <ReactSVG className="flag-icon" src={generateStaticPath('/img/flag/' + ('' + chapter.language).toLowerCase() + '.svg')} />
          </div>
        </div>
        <div className="text-truncate py-0 mb-1">
          <span className="fas fa-users fa-fw mr-1" />
          <Link
            href={'/user?user=' + (chapter ? chapter.author.cif : '')}
            as={'/user/' + (chapter ? chapter.author.cif + '/' + encodeURI(chapter.author.displayName) : '')}
          >
            <a>{chapter && chapter.author.displayName}</a>
          </Link>
        </div>
        <div className="text-truncate py-0 mb-1">{chapter && moment(chapter.lastUpdate).fromNow()}</div>
      </div>
    );
  }
}

FictionCard.propTypes = {
  t: PropTypes.func.isRequired,
  chapter: PropTypes.object,
};

export default FictionCard;
