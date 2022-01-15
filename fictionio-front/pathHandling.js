exports.faviconInterceptor = (req, res, nextFromFavicon) => {
  const pathname = req.url;
  try {
    if (pathname === '/favicon.ico') {
      req.url = '/static/img/favicon.ico';
    } else if (pathname === '/favicon-96x96.png') {
      req.url = '/static/img/favicon-96x96.png';
    } else if (pathname === '/favicon-192x192.png') {
      req.url = '/static/img/favicon-192x192.png';
    }
  } catch (err) {
    //handle err
  }
  nextFromFavicon();
};

exports.googleVerificationInterceptor = (req, res, nextFromFavicon) => {
  const pathname = req.url;
  try {
    if (pathname === '/google5aa2355887887eeb.html') {
      req.url = '/static/google5aa2355887887eeb.html';
    }
  } catch (err) {
    //handle err
  }
  nextFromFavicon();
};

exports.urlParameterIntercepter = (req, res, nextFromUrl) => {
  // Put the preprocessing here.
  const pathname = req.url;
  try {
    if (pathname.indexOf('_next') < 0 && pathname.indexOf('static') < 0) {
      const pathList = pathname.split('/');
      let previousPath;
      let passDataQueryString = '';
      let purePathWithoutNumber = '';
      let firstCount = true;
      if (pathList[pathList.length - 1] === '') {
        pathList.pop();
      }
      for (let i = 1; i < 3; i++) {
        if (firstCount) {
          previousPath = pathList[i];
          if(!previousPath) {
            previousPath ='';
          }
          purePathWithoutNumber = purePathWithoutNumber + '/' + pathList[i];
          firstCount = false;
        } else {
          if(pathList[i]) {
          passDataQueryString = passDataQueryString + '&' + previousPath + '=' + pathList[i];
          }
        }
      }
      if (passDataQueryString !== '' ) {
        req.url = purePathWithoutNumber + '?' + passDataQueryString;
      }
    }
   
  } catch (err) {
    // Do Nothing
  }
  nextFromUrl();
};
