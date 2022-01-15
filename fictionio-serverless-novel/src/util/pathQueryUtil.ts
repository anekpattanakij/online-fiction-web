export const extractPathFromQueryString = (input: string) => {
  if (!input) {
    return '';
  }
  if (input.indexOf('?') > -1) {
    const splitString = input.split('?');
    return splitString.length === 1 ? input : splitString[0];
  } else {
    return input;
  }
};
