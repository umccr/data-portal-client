const STAGE = process.env.REACT_APP_STAGE;
const REGION = process.env.REACT_APP_REGION;
const IS_LOCAL = STAGE === 'localhost';
const OAUTH_DOMAIN = `${process.env.REACT_APP_OAUTH_DOMAIN}.auth.${REGION}.amazoncognito.com`;

const config = {
  apiGateway: {
    REGION: REGION,
    URL: IS_LOCAL
      ? `http://${process.env.REACT_APP_API_URL}`
      : `https://${process.env.REACT_APP_API_URL}`,
  },
  cognito: {
    REGION: REGION,
    USER_POOL_ID: process.env.REACT_APP_COG_USER_POOL_ID,
    APP_CLIENT_ID: IS_LOCAL
      ? process.env.REACT_APP_COG_APP_CLIENT_ID_LOCAL
      : process.env.REACT_APP_COG_APP_CLIENT_ID_STAGE,
    IDENTITY_POOL_ID: process.env.REACT_APP_COG_IDENTITY_POOL_ID,
    OAUTH: {
      domain: OAUTH_DOMAIN,
      scope: ['email', 'openid', 'aws.cognito.signin.user.admin', 'profile'],
      redirectSignIn: IS_LOCAL
        ? process.env.REACT_APP_OAUTH_REDIRECT_IN_LOCAL
        : process.env.REACT_APP_OAUTH_REDIRECT_IN_STAGE,
      redirectSignOut: IS_LOCAL
        ? process.env.REACT_APP_OAUTH_REDIRECT_OUT_LOCAL
        : process.env.REACT_APP_OAUTH_REDIRECT_OUT_STAGE,
      responseType: 'code',
    },
  },
  htsget: {
    URL: IS_LOCAL
      ? `http://${process.env.REACT_APP_HTSGET_URL}`
      : `https://${process.env.REACT_APP_HTSGET_URL}`,
    ENDPOINT_READS: '/reads/',
    ENDPOINT_VARIANTS: '/variants/',
  },
};

export default config;
