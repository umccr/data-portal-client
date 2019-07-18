import * as config from './config.json';

const STAGE = process.env.REACT_APP_STAGE;

const base = {
    apiGateway: {
        REGION: config.main_region,
        URL: `https://2a0mvgomd8.execute-api.ap-southeast-2.amazonaws.com/${STAGE}`,
    },
};

const localhostConfig = {
    cognito: {
        REGION: config.main_region,
        USER_POOL_ID: config.cognito_user_pool_id,
        APP_CLIENT_ID: config.cognito_app_client_id_localhost,
        IDENTITY_POOL_ID: config.cognito_identity_pool_id,
        OAUTH: {
            domain: `${config.cognito_oauth_domain_localhost}.auth.ap-southeast-2.amazoncognito.com`,
            scope: config.cognito_oauth_scope,
            redirectSignIn: config.cognito_oauth_redirect_signin_localhost,
            redirectSignOut: config.cognito_oauth_redirect_signout_localhost,
            responseType: config.cognito_oauth_response_type,
        },
    },
};

const stageConfig = {
    cognito: {
        REGION: config.main_region,
        USER_POOL_ID: config.cognito_user_pool_id,
        APP_CLIENT_ID: config.cognito_app_client_id_stage,
        IDENTITY_POOL_ID: config.cognito_identity_pool_id,
        OAUTH: {
            domain: config.cognito_oauth_domain_stage,
            scope: config.cognito_oauth_scope,
            redirectSignIn: config.cognito_oauth_redirect_signin,
            redirectSignOut: config.cognito_oauth_redirect_signout,
            responseType: config.cognito_oauth_response_type,
        },
    },
};

const config = STAGE === 'localhost' ? localhostConfig : stageConfig;

export default {
    ...base,
    ...config,
};
