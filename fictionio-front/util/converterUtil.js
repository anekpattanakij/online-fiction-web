import _ from 'lodash';

export const preventNaNNumber = input => {
  return _.isNaN(input) || _.isUndefined(input) ? 0 : input;
};
