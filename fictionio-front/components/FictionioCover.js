import React from 'react';
import PropTypes from 'prop-types';
import { generateStaticPath } from '../util/staticPathUtil';
import ReactSVG from 'react-svg';

const FictionioCover = ({ width, height }) => {
  return (
    <ReactSVG
      src={generateStaticPath('/img/fictionio-cover.svg')}
      beforeInjection={svg => {
        svg.setAttribute(
          'style',
          'height:' +
            (height && typeof height === 'number' ? height : 160) +
            'px;width: ' +
            (width && typeof width === 'number' ? width : 80) +
            'px',
        );
      }}
      wrapper="div"
      className="max-width p-0"
    />
  );
};

FictionioCover.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};

export default FictionioCover;
