import { createTransform } from 'redux-persist';

const ExpiredTransform = (expireInMinutes, whitelist) =>
  createTransform(
    inboundState => {
      if (inboundState.expirePersistTime) {
        return { ...inboundState };
      } else {
        var expireDate = new Date();
        expireDate.setMinutes(expireDate.getMinutes() + expireInMinutes);
        return { ...inboundState, expirePersistTime: expireDate };
      }
    },
    outboundState => {
      if (outboundState.expirePersistTime && outboundState.expirePersistTime < new Date()) {
        return {};
      } else {
        return { ...outboundState };
      }
    },
    // define which reducers this transform gets called for.
    { whitelist },
  );

export default ExpiredTransform;
