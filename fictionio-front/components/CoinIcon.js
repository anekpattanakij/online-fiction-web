import React from 'react';
import { generateStaticPath } from '../util/staticPathUtil';

const CoinIcon = () => {
  return (
    <img className="coin-icon" src={generateStaticPath('/img/gold.png')} />
  );
};

export default CoinIcon;
