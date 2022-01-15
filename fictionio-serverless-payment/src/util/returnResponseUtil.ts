import * as ErrorSet from '../common/error';

export const responseTransform = (
  response: any,
  error: boolean,
  returnObject: any,
) => {
  if (error) {
    return (response.body = JSON.stringify({
      result: 'fail',
      data:
        returnObject instanceof ErrorSet.Error
          ? {
              code: returnObject.code,
              message: returnObject.message,
            }
          : '',
    }));
  } else {
    return (response.body = JSON.stringify({
      result: 'success',
      data: returnObject,
    }));
  }
};
