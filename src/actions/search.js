import { API } from 'aws-amplify';
import {
  SEARCH_QUERY_PARAMS_UPDATED,
  SEARCH_QUERY_STARTED_RUNNING,
  SEARCH_QUERY_SUCCESS,
  SEARCH_QUERY_FAILURE,
  SEARCH_QUERY_CLEAR_ERR_MSG,
} from '../actionTypes';
import history from '../history';

export const updateSearchQueryPrams = (queryParams) => {
  return {
    type: SEARCH_QUERY_PARAMS_UPDATED,
    payload: {
      params: queryParams,
    },
  };
};

export const beforeRunningSearchQuery = (queryParams) => {
  const paramList = [];

  // Let's now compose a new url with new search params
  for (let [key, value] of Object.entries(queryParams)) {
    paramList.push(`${key}=${value}`);
  }

  history.push('/search?' + paramList.join('&'));

  return {
    type: SEARCH_QUERY_STARTED_RUNNING,
    payload: {
      searchParams: queryParams,
    },
  };
};

export const startRunningSearchQuery = (queryParams) => {
  return async (dispatch) => {
    // Mark search query has started running
    dispatch(beforeRunningSearchQuery(queryParams));

    try {
      // Filter out null parameters
      const paramKeys = Object.keys(queryParams).filter((k) => queryParams[k] !== null);
      const paramsString = paramKeys.map((key) => `${key}=${queryParams[key]}`).join('&');

      const data = await API.get('files', `/files?${paramsString}`, {});

      dispatch({
        type: SEARCH_QUERY_SUCCESS,
        payload: {
          data,
          errorMessage: null,
        },
      });
    } catch (e) {
      let errorMessage;

      if (e.response) {
        errorMessage = `Query Failed - ${e.response.data.errors}`;
      } else {
        errorMessage = `Unknown Error - ${e.message}`;
      }

      dispatch({
        type: SEARCH_QUERY_FAILURE,
        payload: {
          errorMessage: errorMessage,
        },
      });
    }
  };
};

export const clearErrorMessage = () => {
  return {
    type: SEARCH_QUERY_CLEAR_ERR_MSG,
  };
};
