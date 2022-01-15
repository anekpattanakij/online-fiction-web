import React from 'react';
import { generateCoverPath } from '../util/staticPathUtil';
import PropTypes from 'prop-types';
import FictionioCover from './FictionioCover';

const BigCover = ({imageUrl}) => {
  return imageUrl && typeof(imageUrl) === 'string' ? (
    <img className="rounded" width="260px" height='390px' src={generateCoverPath(imageUrl)} />
  ) : (
    <div className="noCover" width="100%">
      <FictionioCover width={260} height={390}/>
    </div>
  );
};

BigCover.propTypes = {
  imageUrl: PropTypes.string,
};

export default BigCover;
