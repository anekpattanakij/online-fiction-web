export const annoucementActionTypes = {
    REQUEST_ANNOUCEMENT_INITIAL: 'REQUEST_ANNOUCEMENT_INITIAL',
    REQUEST_ANNOUCEMENT_SUCCESS: 'REQUEST_ANNOUCEMENT_SUCCESS',
    REQUEST_ANNOUCEMENT_FAIL: 'REQUEST_ANNOUCEMENT_FAIL',
  };
  
  // Action for dispath
  
  export const loadAnnoucement = () => {
    return {
      type: annoucementActionTypes.REQUEST_ANNOUCEMENT_INITIAL,
      payload: {},
    };
  };
  