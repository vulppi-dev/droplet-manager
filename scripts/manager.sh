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

npm --prefix=$BUILD_PATH/manager --production=false i
npm --prefix=$BUILD_PATH/manager run build

if [ -f $BUILD_PATH/manager/dist/index.js ]; then
  rimraf $APPS_PATH/manager
  mkdir -p $APPS_PATH/manager
  cp -r $BUILD_PATH/manager/dist $APPS_PATH/manager/
  cp $BUILD_PATH/manager/package.json $APPS_PATH/manager/
  npm --prefix=$APPS_PATH/manager i
fi

pm2 delete manager
cd $APPS_PATH/manager && pm2 start --name manager --update-env npm -- start
pm2 save

rm -rf $BUILD_PATH/manager