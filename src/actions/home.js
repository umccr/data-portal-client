import {
    HOME_QUERY_FAILURE,
    HOME_QUERY_STARTED_RUNNING,
    HOME_QUERY_SUCCESS,
    HOME_QUERY_PARAMS_UPDATED,
    HOME_QUERY_CLEAR_ERR_MSG,
} from '../actionTypes';
import { API } from 'aws-amplify';
// import history from '../history';

export const updateHomeQueryPrams = queryParams => {
    return {
        type: HOME_QUERY_PARAMS_UPDATED,
        payload: {
            params: queryParams,
        },
    };
};

export const beforeRunningHomeQuery = queryParams => {
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

export const startRunningHomeQuery = queryParams => {
    return async dispatch => {
        dispatch(beforeRunningHomeQuery(queryParams));

        try {
            // Filter out null parameters
            const paramKeys = Object.keys(queryParams).filter(
                k => queryParams[k] !== null,
            );

            const paramsString = paramKeys
                .map(key => `${key}=${queryParams[key]}`)
                .join('&');

            const data = await API.get('files', `/lims/?${paramsString}`, {});

            dispatch({
                type: HOME_QUERY_SUCCESS,
                payload: {
                    data,
                    errorMessage: null
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
