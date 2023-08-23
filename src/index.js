import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { Amplify, Auth } from 'aws-amplify';
import App from './App';
import * as serviceWorker from './serviceWorker';
import config from './config';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducers';
import { createTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { Alert, AlertTitle } from '@material-ui/lab';

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
        name: 'files',
        endpoint: config.apiGateway.URL,
        region: config.apiGateway.REGION,
        custom_header: async () => {
          return {
            Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
          };
        },
      },
    ],
  },
});

const store = createStore(reducer, applyMiddleware(thunk));

const theme = createTheme({
  props: {
    MuiButton: {
      size: 'small',
    },
    MuiFilledInput: {
      margin: 'dense',
    },
    MuiFormControl: {
      margin: 'dense',
    },
    MuiFormHelperText: {
      margin: 'dense',
    },
    MuiIconButton: {
      size: 'small',
    },
    MuiInputBase: {
      margin: 'dense',
    },
    MuiInputLabel: {
      margin: 'dense',
    },
    MuiListItem: {
      dense: true,
    },
    MuiOutlinedInput: {
      margin: 'dense',
    },
    MuiFab: {
      size: 'small',
    },
    MuiTable: {
      size: 'small',
    },
    MuiTextField: {
      margin: 'dense',
    },
    MuiToolbar: {
      variant: 'dense',
    },
  },
  overrides: {
    MuiIconButton: {
      sizeSmall: {
        marginLeft: 4,
        marginRight: 4,
        padding: 12,
      },
    },
  },
});

ReactDOM.render(
  <Provider store={store}>
    <Alert severity='error' style={{ position: 'fixed', width: '100%', zIndex: 10 }}>
      <AlertTitle>
        We are moving! {`Please use the new portal at `}
        <a href='https://portal.umccr.org'>https://portal.umccr.org</a>
      </AlertTitle>
    </Alert>
    <Router>
      <MuiThemeProvider theme={theme}>
        <App />
      </MuiThemeProvider>
    </Router>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
