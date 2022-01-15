import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '../../i18n';
import { generateCoverPath } from '../../util/staticPathUtil';
import FictionioCover from '../FictionioCover';
import ReactSVG from 'react-svg';
import { generateStaticPath } from '../../util/staticPathUtil';

class TopChapterItem extends React.Component {
  render() {
    const { t, chapter } = this.props;
    return (
      <li className="list-group-item px-2 py-1">
        <div className="hover tiny_logo rounded float-left mr-2">
          <Link
            href={'/chapter?chapter=' + (chapter ? chapter.chapterId : '')}
            as={'/chapter/' + (chapter ? chapter.chapterId + '/' + encodeURI(chapter.chapterName) : '')}
          >
            <a>
              {chapter && chapter.displayCover && chapter.displayCover !== '' ? (
                <img
                  className="rounded max-width"
                  src={generateCoverPath(chapter.displayCover)}
                  style={{ width: '40px', height: '60px' }}
                />
              ) : (
                <FictionioCover width={40} height={60} />
              )}
            </a>
          </Link>
        </div>
        <p className="text-truncate pt-0 pb-1 mb-1 border-bottom">
          <span className="fas fa-book fa-fw " />{' '}
          <Link
            href={'/fiction?fiction=' + (chapter ? chapter.fictionId : '')}
            as={'/fiction/' + (chapter ? chapter.fictionId + '/' + encodeURI(chapter.fictionDisplayName) : '')}
          >
            <a>{chapter && chapter.fictionDisplayName}</a>
          </Link>
        </p>
        <p className="text-truncate py-0 mb-1">
          <span className="float-left">
            <span className="far fa-file fa-fw " />{' '}
            <Link
              href={'/chapter?chapter=' + (chapter ? chapter.chapterId : '')}
              as={'/chapter/' + (chapter ? chapter.chapterId + '/' + encodeURI(chapter.chapterName) : '')}
            >
              <a className="">
                {!chapter || chapter.displayChapterNumber === 0
                  ? t('common:long-special')
                  : t('home:long-chapter') + chapter.displayChapterNumber}
              </a>
            </Link>
            <ReactSVG className="flag-icon pl-1" src={generateStaticPath('/img/flag/' + ('' + chapter.language).toLowerCase() + '.svg')} />
          </span>
          <span className="float-right">
            <span className="fas fa-star fa-fw " title="rating" />
            {chapter && chapter.rate ? chapter.rate.toFixed(2) : 0}
          </span>
        </p>
      </li>
    );
  }
}

TopChapterItem.propTypes = {
  t: PropTypes.func.isRequired,
  chapter: PropTypes.object,
};

export default TopChapterItem;
