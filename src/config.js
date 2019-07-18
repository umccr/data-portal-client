import * as CONFIG from './config.json';

const STAGE = process.env.REACT_APP_STAGE;

const base = {
    apiGateway: {
        REGION: CONFIG.main_region.value,
        URL: `https://2a0mvgomd8.execute-api.ap-southeast-2.amazonaws.com/${STAGE}`,
    },
};

const localhostConfig = {
    cognito: {
        REGION: CONFIG.main_region.value,
        USER_POOL_ID: CONFIG.cognito_user_pool_id.value,
        APP_CLIENT_ID: CONFIG.cognito_app_client_id_localhost.value,
        IDENTITY_POOL_ID: CONFIG.cognito_identity_pool_id.value,
        OAUTH: {
            domain: `${CONFIG.cognito_oauth_domain.value}.auth.ap-southeast-2.amazoncognito.com`,
            scope: CONFIG.cognito_oauth_scope.value,
            redirectSignIn: CONFIG.cognito_oauth_redirect_signin_localhost.value,
            redirectSignOut: CONFIG.cognito_oauth_redirect_signout_localhost.value,
            responseType: CONFIG.cognito_oauth_response_type.value,
        },
    },
};

const stageConfig = {
    cognito: {
        REGION: CONFIG.main_region.value,
        USER_POOL_ID: CONFIG.cognito_user_pool_id.value,
        APP_CLIENT_ID: CONFIG.cognito_app_client_id_stage.value,
        IDENTITY_POOL_ID: CONFIG.cognito_identity_pool_id.value,
        OAUTH: {
            domain: `${CONFIG.cognito_oauth_domain.value}.auth.ap-southeast-2.amazoncognito.com`,
            scope: CONFIG.cognito_oauth_scope.value,
            redirectSignIn: CONFIG.cognito_oauth_redirect_signin.value,
            redirectSignOut: CONFIG.cognito_oauth_redirect_signout.value,
            responseType: CONFIG.cognito_oauth_response_type.value,
        },
    },
};

const currentConfig = STAGE === 'localhost' ? localhostConfig : stageConfig;

export default {
    ...base,
    ...currentConfig,
};
