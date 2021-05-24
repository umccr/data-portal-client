import {
  RUN_QUERY_FAILURE,
  RUN_QUERY_STARTED_RUNNING,
  RUN_QUERY_SUCCESS,
  RUN_QUERY_PARAMS_UPDATED,
  RUN_QUERY_CLEAR_ERR_MSG,
  RUN_GDS_QUERY_FAILURE,
  RUN_GDS_QUERY_STARTED_RUNNING,
  RUN_GDS_QUERY_SUCCESS,
  RUN_GDS_QUERY_PARAMS_UPDATED,
  RUN_GDS_QUERY_CLEAR_ERR_MSG,
} from '../actionTypes';
import { API } from 'aws-amplify';
// import history from '../history';

export const updateRunQueryPrams = (queryParams) => {
  return {
    type: RUN_QUERY_PARAMS_UPDATED,
    payload: {
      params: queryParams,
    },
  };
};

export const beforeRunQuery = (queryParams) => {
  const paramList = [];

  for (let [key, value] of Object.entries(queryParams)) {
    paramList.push(`${key}=${value}`);
  }

  //history.push('/?' + paramList.join('&'));

  return {
    type: RUN_QUERY_STARTED_RUNNING,
    payload: {
      runParams: queryParams,
    },
  };
};

export const startRunQuery = (queryParams, runId) => {
  return async (dispatch) => {
    dispatch(beforeRunQuery(queryParams));

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

      const extraParams = {
        queryStringParameters: {
          run: `${runId}`,
        },
      };

      const data = await API.get('files', `/s3/?${paramsString}`, extraParams);

      dispatch({
        type: RUN_QUERY_SUCCESS,
        payload: {
          data,
          errorMessage: null,
        },
      });
    } catch (e) {
      let errorMessage;

      if (e.response) {
        errorMessage = `Query Failed - ${e.response.data.error}`;
      } else {
        errorMessage = `Unknown Error - ${e.message}`;
      }

      dispatch({
        type: RUN_QUERY_FAILURE,
        payload: {
          errorMessage: errorMessage,
        },
      });
    }
  };
};

export const clearErrorMessage = () => {
  return {
    type: RUN_QUERY_CLEAR_ERR_MSG,
  };
};

// ---

export const updateRunGDSQueryPrams = (queryParams) => {
  return {
    type: RUN_GDS_QUERY_PARAMS_UPDATED,
    payload: {
      params: queryParams,
    },
  };
};

export const beforeRunGDSQuery = (queryParams) => {
  const paramList = [];

  for (let [key, value] of Object.entries(queryParams)) {
    paramList.push(`${key}=${value}`);
  }

  //history.push('/?' + paramList.join('&'));

  return {
    type: RUN_GDS_QUERY_STARTED_RUNNING,
    payload: {
      runGDSParams: queryParams,
    },
  };
};

export const startRunGDSQuery = (queryParams, runId) => {
  return async (dispatch) => {
    dispatch(beforeRunGDSQuery(queryParams));

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

      const extraParams = {
        queryStringParameters: {
          run: `${runId}`,
        },
      };

      const data = await API.get('files', `/gds/?${paramsString}`, extraParams);

      dispatch({
        type: RUN_GDS_QUERY_SUCCESS,
        payload: {
          data,
          errorMessage: null,
        },
      });
    } catch (e) {
      let errorMessage;

      if (e.response) {
        errorMessage = `Query Failed - ${e.response.data.error}`;
      } else {
        errorMessage = `Unknown Error - ${e.message}`;
      }

      dispatch({
        type: RUN_GDS_QUERY_FAILURE,
        payload: {
          errorMessage: errorMessage,
        },
      });
    }
  };
};

export const clearGDSErrorMessage = () => {
  return {
    type: RUN_GDS_QUERY_CLEAR_ERR_MSG,
  };
};
