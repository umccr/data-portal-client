import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import config from './config';
import { Amplify } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
    oauth: config.cognito.OAUTH,
  },
  API: {
    endpoints: [
      {
        name: 'portal',
        endpoint: config.apiGateway.URL,
        region: config.apiGateway.REGION,
        custom_header: async () => {
          return {
            Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
          };
        },
      },
      {
        name: 'gpl',
        endpoint: config.gpl.URL,
        region: config.gpl.REGION,
        service: config.gpl.SERVICE,
      },
    ],
  },
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
