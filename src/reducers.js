import {
    AUTH_UPDATE,
    SEARCH_QUERY_PARAMS_UPDATED,
    SEARCH_QUERY_STARTED_RUNNING,
    SEARCH_QUERY_FAILURE,
    SEARCH_QUERY_SUCCESS,
} from './actionTypes';

const defaultSearchParams = {
    query: '',
    sortCol: null,
    sortAsc: true,
    page: 0,
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
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case AUTH_UPDATE:
            console.log(action.payload);
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
                    ...state.payload,
                },
            };
        case SEARCH_QUERY_STARTED_RUNNING:
            return {
                ...state,
                searchResult: {
                    ...defaultSearchResult,
                    loading: true,
                    searchParams: action.payload.searchParams,
                },
            };
        case SEARCH_QUERY_FAILURE:
            return {
                ...state,
                searchResult: {
                    ...defaultSearchResult,
                    ...action.payload,
                    loading: false,
                },
            };
        case SEARCH_QUERY_SUCCESS:
            return {
                ...state,
                searchResult: {
                    ...defaultSearchResult,
                    ...action.payload,
                    loading: false,
                },
            };
        default:
            return state;
    }
};

export default reducer;
