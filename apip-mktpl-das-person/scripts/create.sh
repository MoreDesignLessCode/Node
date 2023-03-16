#!/usr/bin/env bash

# make .env available to us
set -a
source .env
set +a

NAME=$1

node node_modules/db-migrate/bin/db-migrate create ${NAME}