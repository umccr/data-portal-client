# UMCCR Data Portal App

React frontend for [UMCCR](https://umccr.org) [Data Portal API](https://github.com/umccr/data-portal-apis)

### Local Development

#### TL;DR
```
node -v
v16.15.0

npm i -g yarn
yarn install

aws sso login --profile dev
export AWS_PROFILE=dev
yarn start
(CTRL+C to stop the dev server)
```

- http://localhost:3000

#### Htsget

You can start local htsget-refserver as follows:

```
aws sso login --profile dev && export AWS_PROFILE=dev && yawsso -p dev
docker compose up -d
curl -s "http://localhost:3100/reads/service-info" | jq
```

See infrastructure FAQ for quick [htsget 101](https://github.com/umccr/infrastructure/tree/master/cdk/apps/htsget#faq) and internal [Wiki htsget user doc](https://github.com/umccr/wiki/tree/master/bioinformatics/htsget).

#### Lint

- Run lint: `yarn lint`
- Fix lint issue: `yarn lint --fix`

#### Audit

- Run `yarn audit` for package security vulnerabilities
- Recommend fixing/updating any package with _direct_ dependencies
- If vulnerabilities found in transitive dependency, but it has yet to resolve, then list them in `package.json > resolutions` node as [Selective Dependency Resolutions condition explained here](https://classic.yarnpkg.com/en/docs/selective-version-resolutions/).

#### Git Flow & Pre-commit Hook

> NOTE: We use [pre-commit](https://github.com/umccr/wiki/blob/master/computing/dev-environment/git-hooks.md). It will guard and enforce static code analysis such as `lint` and any security `audit` via pre-commit hook. You are encouraged to fix those. If you wish to skip this for good reason, you can by-pass [Git pre-commit hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) by using `git commit --no-verify` flag.

```commandline
git config --unset core.hooksPath
pre-commit install
pre-commit run --all-files
```

- The default branch is `dev`. Any merges are CI/CD to `DEV` account environment.
- The `main` branch is production. Any merges are CI/CD to `PROD` account environment.
- Merge to `main` should be fast-forward merge from `dev` to maintain sync and linearity as follows:
```
git checkout main
git merge --ff-only dev
git push origin main
```

#### IDE

- Recommended to use JetBrains WebStorm IDE
- Code style use indent with `2` spaces, no tab 
- For Visual Studio Code, the following extensions are recommended
    - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
    - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Deployment

- Build specification `buildspec.yml` reference for AWS CodeBuild
