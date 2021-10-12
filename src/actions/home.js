import {
  HOME_QUERY_FAILURE,
  HOME_QUERY_STARTED_RUNNING,
  HOME_QUERY_SUCCESS,
  HOME_QUERY_PARAMS_UPDATED,
  HOME_QUERY_CLEAR_ERR_MSG,
} from '../actionTypes';
import { API } from 'aws-amplify';
// import history from '../history';

export const updateHomeQueryPrams = (queryParams) => {
  return {
    type: HOME_QUERY_PARAMS_UPDATED,
    payload: {
      params: queryParams,
    },
  };
};

export const beforeRunningHomeQuery = (queryParams) => {
  const paramList = [];

  for (let [key, value] of Object.entries(queryParams)) {
    paramList.push(`${key}=${value}`);
  }

  //history.push('/?' + paramList.join('&'));

  return {
    type: HOME_QUERY_STARTED_RUNNING,
    payload: {
      homeParams: queryParams,
    },
  };
};

export const startRunningHomeQuery = (queryParams) => {
  return async (dispatch) => {
    dispatch(beforeRunningHomeQuery(queryParams));

    try {
      // TODO improve when refactoring API call code
      // append paramsString for Django REST API style ordering parameter based on sortCol and sortAsc
      let ordering = queryParams['sortCol'];
      if (ordering && !queryParams['sortAsc']) {
        ordering = '-' + ordering;
      }

      // Defins the paramter for the API
      // Reference: https://docs.amplify.aws/lib/restapi/fetch/q/platform/js/#get-requests
      const APIConfig = {
        queryStringParameters: {
          ...queryParams,
          ordering: ordering,
        },
      };

      const data = await API.get('files', `/metadata/`, APIConfig);

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
        type: HOME_QUERY_SUCCESS,
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
        type: HOME_QUERY_FAILURE,
        payload: {
          errorMessage: errorMessage,
        },
      });
    }
  };
};

export const clearErrorMessage = () => {
  return {
    type: HOME_QUERY_CLEAR_ERR_MSG,
  };
};
