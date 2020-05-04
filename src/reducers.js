import {
  AUTH_UPDATE,
  SEARCH_QUERY_PARAMS_UPDATED,
  SEARCH_QUERY_STARTED_RUNNING,
  SEARCH_QUERY_FAILURE,
  SEARCH_QUERY_SUCCESS,
  SEARCH_QUERY_CLEAR_ERR_MSG,
  HOME_QUERY_SUCCESS,
  HOME_QUERY_FAILURE,
  HOME_QUERY_STARTED_RUNNING,
  HOME_QUERY_PARAMS_UPDATED,
  HOME_QUERY_CLEAR_ERR_MSG,
  SUBJECT_QUERY_SUCCESS,
  SUBJECT_QUERY_FAILURE,
  SUBJECT_QUERY_STARTED_RUNNING,
  SUBJECT_QUERY_PARAMS_UPDATED,
  SUBJECT_QUERY_CLEAR_ERR_MSG,
  SUBJECT_GDS_QUERY_SUCCESS,
  SUBJECT_GDS_QUERY_FAILURE,
  SUBJECT_GDS_QUERY_STARTED_RUNNING,
  SUBJECT_GDS_QUERY_PARAMS_UPDATED,
  SUBJECT_GDS_QUERY_CLEAR_ERR_MSG,
  RUN_QUERY_SUCCESS,
  RUN_QUERY_FAILURE,
  RUN_QUERY_STARTED_RUNNING,
  RUN_QUERY_PARAMS_UPDATED,
  RUN_QUERY_CLEAR_ERR_MSG,
  RUN_GDS_QUERY_SUCCESS,
  RUN_GDS_QUERY_FAILURE,
  RUN_GDS_QUERY_STARTED_RUNNING,
  RUN_GDS_QUERY_PARAMS_UPDATED,
  RUN_GDS_QUERY_CLEAR_ERR_MSG,
  RUN_META_QUERY_SUCCESS,
  RUN_META_QUERY_FAILURE,
  RUN_META_QUERY_STARTED_RUNNING,
  RUN_META_QUERY_PARAMS_UPDATED,
  RUN_META_QUERY_CLEAR_ERR_MSG,
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

const defaultHomeParams = {
  sortCol: 'subject_id',
  sortAsc: false,
  page: null,
  rowsPerPage: 20,
  search: '',
};

const defaultHomeResult = {
  data: {},
  loading: false,
  errorMessage: null,
};

const defaultSubjectParams = {
  sortCol: 'key',
  sortAsc: true,
  page: null,
  rowsPerPage: 20,
  search: '',
};

const defaultSubjectResult = {
  data: {},
  loading: false,
  errorMessage: null,
};

const defaultSubjectGDSParams = {
  sortCol: 'path',
  sortAsc: true,
  page: null,
  rowsPerPage: 20,
  search: '',
};

const defaultSubjectGDSResult = {
  data: {},
  loading: false,
  errorMessage: null,
};

export const defaultRunParams = {
  sortCol: 'key',
  sortAsc: true,
  page: null,
  rowsPerPage: 10,
  search: '.html$',
};

const defaultRunResult = {
  data: {},
  loading: false,
  errorMessage: null,
};

export const defaultRunGDSParams = {
  sortCol: 'path',
  sortAsc: true,
  page: null,
  rowsPerPage: 10,
  search: '.html$',
};

const defaultRunGDSResult = {
  data: {},
  loading: false,
  errorMessage: null,
};

export const defaultRunMetaParams = {
  sortCol: 'subject_id',
  sortAsc: false,
  page: null,
  rowsPerPage: 10,
  search: '',
};

const defaultRunMetaResult = {
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
  homeResult: {
    ...defaultHomeResult,
  },
  homeParams: {
    ...defaultHomeParams,
  },
  subjectResult: {
    ...defaultSubjectResult,
  },
  subjectParams: {
    ...defaultSubjectParams,
  },
  subjectGDSResult: {
    ...defaultSubjectGDSResult,
  },
  subjectGDSParams: {
    ...defaultSubjectGDSParams,
  },
  runResult: {
    ...defaultRunResult,
  },
  runParams: {
    ...defaultRunParams,
  },
  runGDSResult: {
    ...defaultRunGDSResult,
  },
  runGDSParams: {
    ...defaultRunGDSParams,
  },
  runMetaResult: {
    ...defaultRunMetaResult,
  },
  runMetaParams: {
    ...defaultRunMetaParams,
  },
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
          errorMessage: null,
        },
      };
    case HOME_QUERY_PARAMS_UPDATED:
      return {
        ...state,
        homeParams: {
          ...defaultHomeParams,
          ...action.payload.params,
        },
      };
    case HOME_QUERY_STARTED_RUNNING:
      return {
        ...state,
        homeResult: {
          ...defaultHomeResult,
          loading: true,
        },
        homeParams: action.payload.homeParams,
      };
    case HOME_QUERY_SUCCESS:
      return {
        ...state,
        homeResult: {
          ...defaultHomeResult,
          data: action.payload.data,
          loading: false,
        },
      };
    case HOME_QUERY_FAILURE:
      return {
        ...state,
        homeResult: {
          ...defaultHomeResult,
          errorMessage: action.payload.errorMessage,
          loading: false,
        },
      };
    case HOME_QUERY_CLEAR_ERR_MSG:
      return {
        ...state,
        homeResult: {
          ...state.homeResult,
          errorMessage: null,
        },
      };
    case SUBJECT_QUERY_PARAMS_UPDATED:
      return {
        ...state,
        subjectParams: {
          ...defaultSubjectParams,
          ...action.payload.params,
        },
      };
    case SUBJECT_QUERY_STARTED_RUNNING:
      return {
        ...state,
        subjectResult: {
          ...defaultSubjectResult,
          loading: true,
        },
        subjectParams: action.payload.subjectParams,
      };
    case SUBJECT_QUERY_SUCCESS:
      return {
        ...state,
        subjectResult: {
          ...defaultSubjectResult,
          data: action.payload.data,
          loading: false,
        },
      };
    case SUBJECT_QUERY_FAILURE:
      return {
        ...state,
        subjectResult: {
          ...defaultSubjectResult,
          errorMessage: action.payload.errorMessage,
          loading: false,
        },
      };
    case SUBJECT_QUERY_CLEAR_ERR_MSG:
      return {
        ...state,
        subjectResult: {
          ...state.subjectResult,
          errorMessage: null,
        },
      };
    case SUBJECT_GDS_QUERY_PARAMS_UPDATED:
      return {
        ...state,
        subjectGDSParams: {
          ...defaultSubjectGDSParams,
          ...action.payload.params,
        },
      };
    case SUBJECT_GDS_QUERY_STARTED_RUNNING:
      return {
        ...state,
        subjectGDSResult: {
          ...defaultSubjectGDSResult,
          loading: true,
        },
        subjectGDSParams: action.payload.subjectGDSParams,
      };
    case SUBJECT_GDS_QUERY_SUCCESS:
      return {
        ...state,
        subjectGDSResult: {
          ...defaultSubjectGDSResult,
          data: action.payload.data,
          loading: false,
        },
      };
    case SUBJECT_GDS_QUERY_FAILURE:
      return {
        ...state,
        subjectGDSResult: {
          ...defaultSubjectGDSResult,
          errorMessage: action.payload.errorMessage,
          loading: false,
        },
      };
    case SUBJECT_GDS_QUERY_CLEAR_ERR_MSG:
      return {
        ...state,
        subjectGDSResult: {
          ...state.subjectGDSResult,
          errorMessage: null,
        },
      };
    case RUN_QUERY_PARAMS_UPDATED:
      return {
        ...state,
        runParams: {
          ...defaultRunParams,
          ...action.payload.params,
        },
      };
    case RUN_QUERY_STARTED_RUNNING:
      return {
        ...state,
        runResult: {
          ...defaultRunResult,
          loading: true,
        },
        runParams: action.payload.runParams,
      };
    case RUN_QUERY_SUCCESS:
      return {
        ...state,
        runResult: {
          ...defaultRunResult,
          data: action.payload.data,
          loading: false,
        },
      };
    case RUN_QUERY_FAILURE:
      return {
        ...state,
        runResult: {
          ...defaultRunResult,
          errorMessage: action.payload.errorMessage,
          loading: false,
        },
      };
    case RUN_QUERY_CLEAR_ERR_MSG:
      return {
        ...state,
        runResult: {
          ...state.runResult,
          errorMessage: null,
        },
      };
    case RUN_GDS_QUERY_PARAMS_UPDATED:
      return {
        ...state,
        runGDSParams: {
          ...defaultRunGDSParams,
          ...action.payload.params,
        },
      };
    case RUN_GDS_QUERY_STARTED_RUNNING:
      return {
        ...state,
        runGDSResult: {
          ...defaultRunGDSResult,
          loading: true,
        },
        runGDSParams: action.payload.runGDSParams,
      };
    case RUN_GDS_QUERY_SUCCESS:
      return {
        ...state,
        runGDSResult: {
          ...defaultRunGDSResult,
          data: action.payload.data,
          loading: false,
        },
      };
    case RUN_GDS_QUERY_FAILURE:
      return {
        ...state,
        runGDSResult: {
          ...defaultRunGDSResult,
          errorMessage: action.payload.errorMessage,
          loading: false,
        },
      };
    case RUN_GDS_QUERY_CLEAR_ERR_MSG:
      return {
        ...state,
        runGDSResult: {
          ...state.runGDSResult,
          errorMessage: null,
        },
      };
    case RUN_META_QUERY_PARAMS_UPDATED:
      return {
        ...state,
        runMetaParams: {
          ...defaultRunMetaParams,
          ...action.payload.params,
        },
      };
    case RUN_META_QUERY_STARTED_RUNNING:
      return {
        ...state,
        runMetaResult: {
          ...defaultRunMetaResult,
          loading: true,
        },
        runMetaParams: action.payload.runMetaParams,
      };
    case RUN_META_QUERY_SUCCESS:
      return {
        ...state,
        runMetaResult: {
          ...defaultRunMetaResult,
          data: action.payload.data,
          loading: false,
        },
      };
    case RUN_META_QUERY_FAILURE:
      return {
        ...state,
        runMetaResult: {
          ...defaultRunMetaResult,
          errorMessage: action.payload.errorMessage,
          loading: false,
        },
      };
    case RUN_META_QUERY_CLEAR_ERR_MSG:
      return {
        ...state,
        runMetaResult: {
          ...state.runMetaResult,
          errorMessage: null,
        },
      };
    default:
      return state;
  }
};

export default reducer;
