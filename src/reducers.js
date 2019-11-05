import {
    AUTH_UPDATE,
    SEARCH_QUERY_PARAMS_UPDATED,
    SEARCH_QUERY_STARTED_RUNNING,
    SEARCH_QUERY_FAILURE,
    SEARCH_QUERY_SUCCESS,
    SEARCH_QUERY_CLEAR_ERR_MSG,
} from './actionTypes';

const defaultSearchParams = {
    query: '',
    sortCol: null,
    sortAsc: null,
    page: null,
    rowsPerPage: 20,
};

const defaultSearchResult = {
    data: {},
    loading: false,
    errorMessage: null,
};

const initialState = {
    authState: 'loading',
    authUser: null,
    authUserInfo: null,
    authError: null,
    searchResult: {
        ...defaultSearchResult,
    },
    searchParams: {
        ...defaultSearchParams,
    },
    // Save a copy of header row to always show table
    searchResultHeaderRow: null,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case AUTH_UPDATE:
            return {
                ...state,
                authState: action.payload.authState,
                authUser: action.payload.authUser,
                authUserInfo: action.payload.authUserInfo,
                authError: action.payload.authError,
            };
        case SEARCH_QUERY_PARAMS_UPDATED:
            return {
                ...state,
                searchParams: {
                    ...defaultSearchParams,
                    ...action.payload.params,
                },
            };
        case SEARCH_QUERY_STARTED_RUNNING:
            return {
                ...state,
                searchResult: {
                    ...defaultSearchResult,
                    loading: true,
                },
                searchParams: action.payload.searchParams,
            };
        case SEARCH_QUERY_FAILURE:
            return {
                ...state,
                searchResult: {
                    ...defaultSearchResult,
                    errorMessage: action.payload.errorMessage,
                    loading: false,
                },
            };
        case SEARCH_QUERY_SUCCESS:
            return {
                ...state,
                searchResult: {
                    ...defaultSearchResult,
                    data: action.payload.data,
                    loading: false,
                },
                searchResultHeaderRow: action.payload.data.rows.headerRow,
            };
        case SEARCH_QUERY_CLEAR_ERR_MSG:
            return {
                ...state,
                searchResult: {
                    ...state.searchResult,
                    errorMessage: null
                }
            };
        default:
            return state;
    }
};

export default reducer;
