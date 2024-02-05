#!/usr/bin/env source
# -*- coding: utf-8 -*-
# This wrapper script is mainly for local development purpose only.
#
# Sourcing this script will perform:
#   1. get required config values from SSM Parameter Store
#   2. export them as VITE_x environment variables
#   3. start local development node server
#
# REQUIRED CLI:
# aws, jq
#
# USAGE:
# Typically (recommended) use in conjunction with Yarn:
#     yarn start
#
# Otherwise source it standalone itself by:
#     source start.sh
#     source start.sh unset
#
# CAVEATS:
# If your Portal Django backend is not running on :8000, then before start
# you can override by, e.g.  export DATA_PORTAL_API_URL=localhost:5000
#
# Try to be POSIX-y. Only tested on macOS! Contrib welcome for other OSs.

if [ "$(ps -p $$ -ocomm=)" = 'zsh' ] || [ "${BASH_SOURCE[0]}" -ef "$0" ]
then
    ps -p $$ -oargs=
    echo "YOU SHOULD SOURCE THIS SCRIPT, NOT EXECUTE IT!"
    exit 1
fi

command -v aws >/dev/null 2>&1 || {
  echo >&2 "AWS CLI COMMAND NOT FOUND. ABORTING..."
  return 1
}

command -v jq >/dev/null 2>&1 || {
  echo >&2 "JQ COMMAND NOT FOUND. ABORTING..."
  return 1
}

if [ -n "$1" ] && [ "$1" = "unset" ]; then
  unset VITE_API_URL
  unset VITE_STAGE
  unset VITE_REGION
  unset VITE_COG_USER_POOL_ID
  unset VITE_COG_IDENTITY_POOL_ID
  unset VITE_COG_APP_CLIENT_ID_LOCAL
  unset VITE_OAUTH_DOMAIN
  unset VITE_OAUTH_REDIRECT_IN_LOCAL
  unset VITE_OAUTH_REDIRECT_OUT_LOCAL
  echo "UNSET VITE ENV VAR"
  return 0
fi

api_url=${DATA_PORTAL_API_URL:-localhost:8000}
htsget_url=${HTSGET_URL:-localhost:3100}

cog_user_pool_id=$(aws ssm get-parameter --name '/data_portal/client/cog_user_pool_id' --with-decryption | jq -r .Parameter.Value)
if [[ "$cog_user_pool_id" == "" ]]; then
  echo "Halt, No valid AWS login session found. Please 'aws sso login --profile dev && export AWS_PROFILE=dev'"
  return 1
fi
cog_identity_pool_id=$(aws ssm get-parameter --name '/data_portal/client/cog_identity_pool_id' --with-decryption | jq -r .Parameter.Value)
cog_app_client_id_local=$(aws ssm get-parameter --name '/data_portal/client/cog_app_client_id_local' --with-decryption | jq -r .Parameter.Value)
oauth_domain=$(aws ssm get-parameter --name '/data_portal/client/oauth_domain' --with-decryption | jq -r .Parameter.Value)
oauth_redirect_in_local=$(aws ssm get-parameter --name '/data_portal/client/oauth_redirect_in_local' --with-decryption | jq -r .Parameter.Value)
oauth_redirect_out_local=$(aws ssm get-parameter --name '/data_portal/client/oauth_redirect_out_local' --with-decryption | jq -r .Parameter.Value)

unsplash_client_id=$(aws ssm get-parameter --name '/data_portal/unsplash/client_id' --with-decryption | jq -r .Parameter.Value)

export VITE_API_URL=$api_url
export VITE_HTSGET_URL=$htsget_url
export VITE_STAGE=localhost
export VITE_REGION=ap-southeast-2
export VITE_COG_USER_POOL_ID=$cog_user_pool_id
export VITE_COG_IDENTITY_POOL_ID=$cog_identity_pool_id
export VITE_COG_APP_CLIENT_ID_LOCAL=$cog_app_client_id_local
export VITE_OAUTH_DOMAIN=$oauth_domain
export VITE_OAUTH_REDIRECT_IN_LOCAL=$oauth_redirect_in_local
export VITE_OAUTH_REDIRECT_OUT_LOCAL=$oauth_redirect_out_local
export VITE_UNSPLASH_CLIENT_ID=$unsplash_client_id
env | grep VITE

yarn run -B vite
