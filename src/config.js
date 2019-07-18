import * as CONFIG from './config.json';

const STAGE = process.env.REACT_APP_STAGE;

const base = {
    apiGateway: {
        REGION: CONFIG.main_region,
        URL: `https://2a0mvgomd8.execute-api.ap-southeast-2.amazonaws.com/${STAGE}`,
    },
};

const localhostConfig = {
    cognito: {
        REGION: CONFIG.main_region,
        USER_POOL_ID: CONFIG.cognito_user_pool_id,
        APP_CLIENT_ID: CONFIG.cognito_app_client_id_localhost,
        IDENTITY_POOL_ID: CONFIG.cognito_identity_pool_id,
        OAUTH: {
            domain: `${CONFIG.cognito_oauth_domain_localhost}.auth.ap-southeast-2.amazoncognito.com`,
            scope: CONFIG.cognito_oauth_scope,
            redirectSignIn: CONFIG.cognito_oauth_redirect_signin_localhost,
            redirectSignOut: CONFIG.cognito_oauth_redirect_signout_localhost,
            responseType: CONFIG.cognito_oauth_response_type,
        },
    },
};

const stageConfig = {
    cognito: {
        REGION: CONFIG.main_region,
        USER_POOL_ID: CONFIG.cognito_user_pool_id,
        APP_CLIENT_ID: CONFIG.cognito_app_client_id_stage,
        IDENTITY_POOL_ID: CONFIG.cognito_identity_pool_id,
        OAUTH: {
            domain: CONFIG.cognito_oauth_domain_stage,
            scope: CONFIG.cognito_oauth_scope,
            redirectSignIn: CONFIG.cognito_oauth_redirect_signin,
            redirectSignOut: CONFIG.cognito_oauth_redirect_signout,
            responseType: CONFIG.cognito_oauth_response_type,
        },
    },
};

const currentConfig = STAGE === 'localhost' ? localhostConfig : stageConfig;

export default {
    ...base,
    ...currentConfig,
};
