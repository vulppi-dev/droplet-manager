#!/usr/bin/env bash

cd $BUILD_PATH && git clone $HOST $NAME

APP_PATH=`${BUILD_PATH}/${NAME}`

if [ -f `$APP_PATH/package.json` ]; then
  npm --prefix=$APP_PATH --production=false i
  cd $APP_PATH && rollup -c $BUILD_PATH/rollup.config.js
  cp $APP_PATH/dist/index.js $APPS_PATH/$NAME.mjs
  pm2 start $APPS_PATH/$NAME.mjs --name $NAME --update-env
  pm2 save
fi

rm -rf $APP_PATH