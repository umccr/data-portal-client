# UMCCR Data Portal App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Local development

Use Terraform output and create a `.env.local` file to store the env variables needed 
for the app to run locally. `{var}` refers to the variable name in Terraform output.

```
REACT_APP_REGION={main_region}
REACT_APP_API_URL={api_domain}
REACT_APP_COG_USER_POOL_ID={cognito_user_pool_id}
REACT_APP_COG_IDENTITY_POOL_ID={cognito_identity_pool_id}
REACT_APP_COG_APP_CLIENT_ID_STAGE={cognito_app_client_id_stage}
REACT_APP_COG_APP_CLIENT_ID_LOCAL={cognito_app_client_id_localhost}
REACT_APP_OAUTH_DOMAIN={cognito_oauth_domain}
REACT_APP_OAUTH_REDIRECT_IN_STAGE={cognito_oauth_redirect_signin}
REACT_APP_OAUTH_REDIRECT_OUT_STAGE={cognito_oauth_redirect_signout}
REACT_APP_OAUTH_REDIRECT_IN_LOCAL={cognito_oauth_redirect_signin_localhost}
REACT_APP_OAUTH_REDIRECT_OUT_LOCAL={cognito_oauth_redirect_signout_localhost}
```

Use `npm start` to start the server on http://localhost:3000


### Deployment

`buildspec.yml` - build specification reference for AWS CodeBuild