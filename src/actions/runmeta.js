import {
  RUN_META_QUERY_FAILURE,
  RUN_META_QUERY_STARTED_RUNNING,
  RUN_META_QUERY_SUCCESS,
  RUN_META_QUERY_PARAMS_UPDATED,
  RUN_META_QUERY_CLEAR_ERR_MSG,
} from '../actionTypes';
import { API } from 'aws-amplify';
// import history from '../history';

export const updateRunMetaQueryPrams = (queryParams) => {
  return {
    type: RUN_META_QUERY_PARAMS_UPDATED,
    payload: {
      params: queryParams,
    },
  };
};

export const beforeRunMetaQuery = (queryParams) => {
  const paramList = [];

  for (let [key, value] of Object.entries(queryParams)) {
    paramList.push(`${key}=${value}`);
  }

  //history.push('/?' + paramList.join('&'));

  return {
    type: RUN_META_QUERY_STARTED_RUNNING,
    payload: {
      runMetaParams: queryParams,
    },
  };
};

export const startRunMetaQuery = (queryParams, runId) => {
  return async (dispatch) => {
    dispatch(beforeRunMetaQuery(queryParams));

    try {
      // Filter out null parameters
      const paramKeys = Object.keys(queryParams).filter((k) => queryParams[k] !== null);

      let paramsString = paramKeys.map((key) => `${key}=${queryParams[key]}`).join('&');

      // TODO improve when refactoring API call code
      // append paramsString for Django REST API style ordering parameter based on sortCol and sortAsc
      if (paramKeys.includes('sortCol')) {
        let ordering = queryParams['sortCol'];
        if (!queryParams['sortAsc']) {
          ordering = '-' + ordering;
        }
        paramsString += '&ordering=' + ordering;
      }

      const data = await API.get('files', `/runs/${runId}/lims/?${paramsString}`, {});

      dispatch({
        type: RUN_META_QUERY_SUCCESS,
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
        type: RUN_META_QUERY_FAILURE,
        payload: {
          errorMessage: errorMessage,
        },
      });
    }
  };
};

export const clearRunMetaErrorMessage = () => {
  return {
    type: RUN_META_QUERY_CLEAR_ERR_MSG,
  };
};
