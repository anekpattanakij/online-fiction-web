const pathToRegexp = require('path-to-regexp');

const pathProcessing = pathToRegexp(
  '/:pathOption/chapters/:chapterOption?/:chapterFunctionOption?',
  [],
  {
    strict: false,
  },
);

const pathVars = pathProcessing.exec(
  '/smM75Auhy3oLuodffujt/chapters',
);
// 
console.log('pathVars');
console.log(pathVars);
console.log('---------');
// console.log(pathVars[1].split('?')[0] === '');

let ratePath = false;
let translatePath = false;
let publishPath = false;
let completePath = false;
let fictionId = null;
let chapterId = null;
let getAsList = false;
let chapterPath = false;
const PATH_CHAPTER_POSITION = 2;

function extractPathFromQueryString(input) {
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

if (pathVars) {
  let maxPathVar = pathVars.length -1;
  console.log(maxPathVar);
  if (!pathVars[maxPathVar] && pathVars.length > 1) {
    console.log('minus');
    maxPathVar = maxPathVar - 1;
  }
  console.log(maxPathVar);
  if (maxPathVar > 1) {
    
    fictionId = pathVars[1];
    chapterId = pathVars[PATH_CHAPTER_POSITION];
    switch (extractPathFromQueryString(pathVars[maxPathVar])) {
      case 'rate':
        ratePath = true;
        break;
      case 'translate':
        translatePath = true;
        break;
      case '':
        getAsList = true;
        break;
      case 'publish':
        publishPath = true;
        break;

        
    }
  }
  if (!chapterId) {
    getAsList = true;
  }
}
console.log(fictionId);
console.log(chapterId);
console.log(publishPath);

const delay = () => {
  const DELAY_TIME = 5000;
  return new Promise(resolve => {
    setTimeout(resolve, DELAY_TIME);
  });
};

const tempFunction = input => {
  const DELAY_TIME = 5000;
  return new Promise(async resolve => {
    const returnPromise = input.map(async it => {
      await delay();
      console.log(it);
    });
    await Promise.all(returnPromise);
  });
};

const temp = [1, 2, 3, 4];
// tempFunction(temp);

const arr = [{ key: 1 }, { key: 2 }, { key: 3 }];
const result = arr.map(async obj => {
  return obj.key;
});
console.log(`Result: ${result}`);
