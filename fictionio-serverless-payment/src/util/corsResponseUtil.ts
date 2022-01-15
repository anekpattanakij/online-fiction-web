export const allowCors = (response: any) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set(
    'Access-Control-Allow-Headers',
    'bearer,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
  );
  response.set('Access-Control-Allow-Credentials', true);
  response.set('Access-Control-Allow-Methods', '*');
};
