# UMCCR Data Portal App

React frontend for [UMCCR](https://umccr.org) [Data Portal API](https://github.com/umccr/data-portal-apis)

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

#### [Yarn](https://yarnpkg.com/cli/install)

- Have it installed globally: `npm i -g yarn`
- Use `yarn install` to install dependencies
- Use `yarn start` to start the server on http://localhost:3000
- Use `yarn build` to build the client

#### Lint

- Run eslint as follows: `yarn lint`
- Fix lint issue, if any: `npx eslint src --fix`

#### Audit

- Run `yarn audit` for package vulnerabilities
- Recommended to fix/update any package with _direct_ dependencies
- If vulnerabilities found in transitive dependency, but it has yet to resolve, then list them in `package.json > resolutions` node as [Selective Dependency Resolutions condition explained here](https://classic.yarnpkg.com/en/docs/selective-version-resolutions/).

#### IDE

- Recommended to use JetBrains WebStorm IDE
- Code style use indent with `2` spaces, no tab 
- For Visual Studio Code, the following extensions are recommended
    - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
    - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Deployment

- Build specification `buildspec.yml` reference for AWS CodeBuild
