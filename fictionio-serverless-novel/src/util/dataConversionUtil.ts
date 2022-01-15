import * as sanitizeHtml from 'sanitize-html';

export const nullOrZero = input => {
  if (!input) {
    return 0;
  } else {
    return input;
  }
};

export const cleanHtmlTag = (input: string) => {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
};

export const cleanNewLineCodeText = (input: string) => {
  return input.replace(/(?:\r\n|\r|\n)/g, '<br>');
};

export const arrayFlatter = (input: Array<any>) => {
  const returnArray = [];
  input.map((arrayItem, key) => {
    returnArray.push(...arrayItem);
  });
  return returnArray;
};

export const removeDupInArray = (input: Array<any>, keyForUnique: string) => {
  const checkUnique = [];
  const returnArray = [];
  input.map((arrayItem, key) => {
    if (
      arrayItem[keyForUnique] &&
      checkUnique.indexOf(arrayItem[keyForUnique]) < 0
    ) {
      returnArray.push(arrayItem);
      checkUnique.push(arrayItem[keyForUnique]);
    }
  });
  return returnArray;
};
