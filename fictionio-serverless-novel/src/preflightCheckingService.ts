const RETURN_PREFLIGHT_STATUS = 204;
import { allowCors } from './util/corsResponseUtil';

export const preflightChecking = handler => (request, response) => {
  if (request.method === 'OPTIONS') {
    allowCors(response);
    response.status(RETURN_PREFLIGHT_STATUS).send('');
  } else {
    handler(request, response);
  }
};
