import { AUTH_UPDATE } from '../actionTypes';

const authUpdate = (auth) => {
  return {
    type: AUTH_UPDATE,
    payload: auth,
  };
};

export default authUpdate;
