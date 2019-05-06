import AUTH_UPDATE from './actionTypes';

const initialState = {
    authState: 'loading',
    authUser: null,
    authUserInfo: null,
    authError: null,
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
        default:
            return state;
    }
};

export default reducer;
