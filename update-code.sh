#!/usr/bin/env bash

REPO_PATH=/opt/manager

git -C $REPO_PATH pull
npm i --production=false --force --prefix $REPO_PATH
pm2 reload all --update-env
pm2 save