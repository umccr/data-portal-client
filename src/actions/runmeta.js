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
      // TODO improve when refactoring API call code
      // append paramsString for Django REST API style ordering parameter based on sortCol and sortAsc
      let ordering = queryParams['sortCol'];
      if (ordering && !queryParams['sortAsc']) {
        ordering = '-' + ordering;
      }

      const extraParams = {
        queryStringParameters: {
          ...queryParams,
          ordering: ordering,
          run: runId,
        },
      };

      const data = await API.get('files', `/metadata/`, extraParams);

      for (const row_data of data.results) {
        const library_id = row_data.library_id;

        // Specify search value
        const APIConfig = {
          queryStringParameters: {
            library_id: library_id,
          },
        };
        const libraryRun = await API.get('files', `/libraryrun/`, APIConfig);
        const libraryRunResults = libraryRun.results;

        // Search for instrument_run_id each row_data
        if (libraryRunResults[0]) {
          row_data['instrument_run_id'] = libraryRunResults[0].instrument_run_id;
        } else {
          row_data['instrument_run_id'] = 'NOT_FOUND';
        }
      }

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
