import {
  SUBJECT_QUERY_FAILURE,
  SUBJECT_QUERY_STARTED_RUNNING,
  SUBJECT_QUERY_SUCCESS,
  SUBJECT_QUERY_PARAMS_UPDATED,
  SUBJECT_QUERY_CLEAR_ERR_MSG,
  SUBJECT_GDS_QUERY_FAILURE,
  SUBJECT_GDS_QUERY_STARTED_RUNNING,
  SUBJECT_GDS_QUERY_SUCCESS,
  SUBJECT_GDS_QUERY_PARAMS_UPDATED,
  SUBJECT_GDS_QUERY_CLEAR_ERR_MSG,
} from '../actionTypes';
import { API } from 'aws-amplify';
// import history from '../history';

export const updateSubjectQueryPrams = (queryParams) => {
  return {
    type: SUBJECT_QUERY_PARAMS_UPDATED,
    payload: {
      params: queryParams,
    },
  };
};

export const beforeRunningSubjectQuery = (queryParams) => {
  const paramList = [];

  for (let [key, value] of Object.entries(queryParams)) {
    paramList.push(`${key}=${value}`);
  }

  //history.push('/?' + paramList.join('&'));

  return {
    type: SUBJECT_QUERY_STARTED_RUNNING,
    payload: {
      subjectParams: queryParams,
    },
  };
};

export const startRunningSubjectQuery = (queryParams, subjectId) => {
  return async (dispatch) => {
    dispatch(beforeRunningSubjectQuery(queryParams));

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
          subject: `${subjectId}`,
        },
      };

      const data = await API.get('files', `/s3/?${paramsString}`, extraParams);

      dispatch({
        type: SUBJECT_QUERY_SUCCESS,
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
        type: SUBJECT_QUERY_FAILURE,
        payload: {
          errorMessage: errorMessage,
        },
      });
    }
  };
};

export const clearErrorMessage = () => {
  return {
    type: SUBJECT_QUERY_CLEAR_ERR_MSG,
  };
};

// ---

export const updateSubjectGDSQueryPrams = (queryParams) => {
  return {
    type: SUBJECT_GDS_QUERY_PARAMS_UPDATED,
    payload: {
      params: queryParams,
    },
  };
};

export const beforeRunningSubjectGDSQuery = (queryParams) => {
  const paramList = [];

  for (let [key, value] of Object.entries(queryParams)) {
    paramList.push(`${key}=${value}`);
  }

  //history.push('/?' + paramList.join('&'));

  return {
    type: SUBJECT_GDS_QUERY_STARTED_RUNNING,
    payload: {
      subjectGDSParams: queryParams,
    },
  };
};

export const startRunningSubjectGDSQuery = (queryParams, subjectId) => {
  return async (dispatch) => {
    dispatch(beforeRunningSubjectGDSQuery(queryParams));

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
          subject: `${subjectId}`,
        },
      };

      const data = await API.get('files', `/gds/?${paramsString}`, extraParams);

      dispatch({
        type: SUBJECT_GDS_QUERY_SUCCESS,
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
        type: SUBJECT_GDS_QUERY_FAILURE,
        payload: {
          errorMessage: errorMessage,
        },
      });
    }
  };
};

export const clearGDSErrorMessage = () => {
  return {
    type: SUBJECT_GDS_QUERY_CLEAR_ERR_MSG,
  };
};
