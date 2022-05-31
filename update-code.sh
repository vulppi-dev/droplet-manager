#!/usr/bin/env bash

$REPO_PATH=/opt/manager

cd $REPO_PATH &&\
git -C $REPO_PATH pull &&\
npm run build

pm2 reload all