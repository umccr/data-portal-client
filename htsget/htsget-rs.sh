#!/usr/bin/env sh
# -*- coding: utf-8 -*-
# This script is mainly for local development purpose only.
#
# REQUIRED CLI:
#   aws, htsget-actix (htsget-rs)
#
# PREREQUISITE:
#   Follow https://rustup.rs to install Rust
#   Once you have Rust, perform `cargo install htsget-actix`
#
# USAGE:
#   export AWS_PROFILE=dev
#   sh htsget-rs.sh
#
# CAVEATS:
#   Try to be POSIX-y. Only tested on macOS! Contrib welcome for other OSs.

command -v aws >/dev/null 2>&1 || {
  echo >&2 "AWS CLI COMMAND NOT FOUND: 'brew info awscli'"
  exit 1
}

command -v htsget-actix >/dev/null 2>&1 || {
  echo >&2 "HTSGET-ACTIX COMMAND NOT FOUND: 'cargo install htsget-actix'"
  exit 1
}

aws sts get-caller-identity >/dev/null 2>&1 || {
  echo >&2 "UNABLE TO LOCATE CREDENTIALS. CHECK YOUR AWS LOGIN SESSION: 'aws sts get-caller-identity'"
  exit 1
}

htsget-actix -c htsget-rs.toml
