const STAGE = import.meta.env.VITE_STAGE;
const REGION = import.meta.env.VITE_REGION;
const IS_LOCAL = STAGE === 'localhost';
const OAUTH_DOMAIN = `${import.meta.env.VITE_OAUTH_DOMAIN}.auth.${REGION}.amazoncognito.com`;

const LAMBDA_PREFIX = `data-portal-api-${IS_LOCAL ? 'dev' : STAGE}-`;

const config = {
  apiGateway: {
    REGION: REGION,
    URL: IS_LOCAL
      ? `http://${import.meta.env.VITE_API_URL}`
      : `https://${import.meta.env.VITE_API_URL}`,
  },
  cognito: {
    REGION: REGION,
    USER_POOL_ID: import.meta.env.VITE_COG_USER_POOL_ID,
    APP_CLIENT_ID: IS_LOCAL
      ? import.meta.env.VITE_COG_APP_CLIENT_ID_LOCAL
      : import.meta.env.VITE_COG_APP_CLIENT_ID_STAGE,
    IDENTITY_POOL_ID: import.meta.env.VITE_COG_IDENTITY_POOL_ID,
    OAUTH: {
      domain: OAUTH_DOMAIN,
      scopes: ['email', 'openid', 'aws.cognito.signin.user.admin', 'profile'],
      redirectSignIn: [
        IS_LOCAL
          ? import.meta.env.VITE_OAUTH_REDIRECT_IN_LOCAL
          : import.meta.env.VITE_OAUTH_REDIRECT_IN_STAGE,
      ],
      redirectSignOut: [
        IS_LOCAL
          ? import.meta.env.VITE_OAUTH_REDIRECT_OUT_LOCAL
          : import.meta.env.VITE_OAUTH_REDIRECT_OUT_STAGE,
      ],
      responseType: 'code' as const,
    },
  },
  htsget: {
    URL: IS_LOCAL
      ? `http://${import.meta.env.VITE_HTSGET_URL}`
      : `https://${import.meta.env.VITE_HTSGET_URL}`,
    ENDPOINT_READS: '/reads/',
    ENDPOINT_VARIANTS: '/variants/',
  },
};

export default config;

export { REGION, LAMBDA_PREFIX };
