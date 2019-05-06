export default {
    apiGateway: {
        REGION: 'ap-southeast-2',
        URL: 'https://okhl40ool5.execute-api.ap-southeast-2.amazonaws.com/dev',
    },
    cognito: {
        REGION: 'ap-southeast-2',
        USER_POOL_ID: 'ap-southeast-2_lAsMCu1oi',
        APP_CLIENT_ID: '917s0fndvbq0k8bf4qoj45na7',
        IDENTITY_POOL_ID: 'ap-southeast-2:ead65687-fd1e-4d4d-999e-e95cec64b783',
        OAUTH: {
            domain: 'data-portal-app-dev.auth.ap-southeast-2.amazoncognito.com',
            scope: [
                'email',
                'profile',
                'openid',
                'aws.cognito.signin.user.admin',
            ],
            redirectSignIn: 'http://localhost:3000',
            redirectSignOut: 'http://localhost:3000',
            responseType: 'code',
        },
    },
};
