#!/usr/bin/env bash

$REPO_PATH=/opt/manager

git -C $REPO_PATH pull
pm2 restart all