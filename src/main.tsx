import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './main.css';
import config from './config';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: config.cognito.USER_POOL_ID,
        userPoolClientId: config.cognito.APP_CLIENT_ID,
        loginWith: {
          oauth: config.cognito.OAUTH,
        },
        identityPoolId: config.cognito.IDENTITY_POOL_ID,
      },
    },
    API: {
      REST: {
        portal: {
          endpoint: config.apiGateway.URL,
          region: config.apiGateway.REGION,
        },
      },
    },
  },
  {
    API: {
      REST: {
        headers: async () => {
          const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
          return { Authorization: `${authToken!}` };
        },
      },
    },
  }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
