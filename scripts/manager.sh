#!/usr/bin/env bash

cd $BUILD_PATH && git clone https://github.com/vulppi-dev/droplet-manager manager

if [ -f $BUILD_PATH/manager/scripts/build.sh ]; then
  cp $BUILD_PATH/manager/scripts/build.sh /opt/scripts/build.sh
  chmod 777 /opt/scripts/build.sh
fi
if [ -f $BUILD_PATH/manager/scripts/update.sh ]; then
  cp $BUILD_PATH/manager/scripts/update.sh /opt/scripts/update.sh
  chmod 777 /opt/scripts/update.sh
fi
if [ -f $BUILD_PATH/manager/scripts/manager.sh ]; then
  cp $BUILD_PATH/manager/scripts/manager.sh /opt/scripts/manager.sh
  chmod 777 /opt/scripts/manager.sh
fi
if [ -f $BUILD_PATH/manager/rollup.config.js ]; then
  cp $BUILD_PATH/manager/rollup.config.js $BUILD_PATH/rollup.config.js
fi

npm --prefix=$BUILD_PATH/manager --production=false i
npm --prefix=$BUILD_PATH/manager run build

if [ -f $BUILD_PATH/manager/dist/index.js ]; then
  cp $BUILD_PATH/manager/dist/index.js $APPS_PATH/manager.mjs
fi

pm2 start $APPS_PATH/manager.mjs --name manager --update-env
pm2 save

rm -rf $BUILD_PATH/manager