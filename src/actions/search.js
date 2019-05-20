import { API } from 'aws-amplify';
import {
    SEARCH_QUERY_PARAMS_UPDATED,
    SEARCH_QUERY_STARTED_RUNNING,
    SEARCH_QUERY_SUCCESS,
    SEARCH_QUERY_FAILURE,
} from '../actionTypes';

export const updateSearchQueryPrams = queryParams => {
    return {
        type: SEARCH_QUERY_PARAMS_UPDATED,
        payload: {
            params: queryParams,
        },
    };
};

export const beforeRunningSearchQuery = queryParams => {
    return {
        type: SEARCH_QUERY_STARTED_RUNNING,
        payload: {
            searchParams: queryParams,
        },
    };
};

export const startRunningSearchQuery = queryParams => {
    return async dispatch => {
        // Mark search query has started running
        dispatch(beforeRunningSearchQuery(queryParams));

        try {
            // Filter out null parameters
            const paramKeys = Object.keys(queryParams).filter(
                k => queryParams[k] !== null,
            );
            const paramsString = paramKeys
                .map(key => `${key}=${queryParams[key]}`)
                .join('&');

            const data = await API.get('files', `/files?${paramsString}`, {});

            dispatch({
                type: SEARCH_QUERY_SUCCESS,
                payload: {
                    data,
                },
            });
        } catch (e) {
            let errorMessage;

            if (e.response) {
                errorMessage = e.response.data.errors;
            } else {
                errorMessage = e.message;
            }

            dispatch({
                type: SEARCH_QUERY_FAILURE,
                payload: {
                    errorMessage: `Query failed: ${errorMessage}`,
                },
            });
        }
    };
};
